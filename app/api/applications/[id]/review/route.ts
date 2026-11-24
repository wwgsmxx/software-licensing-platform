import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/state-machine";
import { notificationChannel } from "@/services/notification/NotificationChannel";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role Guard: ADMIN or REVIEWER
    const isAuthorized =
      session.roleCode === "ADMIN" ||
      session.roleCode === "REVIEWER" ||
      session.roleCode === "LICENSE_MANAGER";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin or Reviewer role required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason, message } = body;

    const application = await db.application.findUnique({
      where: { id },
      include: { software: true, user: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    let targetStatus: string;
    let commentText: string = "";
    let issuedLicense: any = null;

    if (action === "APPROVE") {
      targetStatus = "APPROVED";
      commentText = "Application approved following technical and signature audit.";
    } else if (action === "REJECT") {
      if (!reason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
      }
      targetStatus = "REJECTED";
      commentText = `Application rejected: ${reason}`;
    } else if (action === "REQUEST_INFO") {
      if (!message) {
        return NextResponse.json({ error: "Information request message is required" }, { status: 400 });
      }
      targetStatus = "ADDITIONAL_INFO_REQUIRED";
      commentText = `Information requested: ${message}`;
    } else {
      return NextResponse.json({ error: "Invalid review action" }, { status: 400 });
    }

    // 1. Validate State Transition Machine Rules
    const check = canTransition(
      application.status as any,
      targetStatus as any,
      session.roleCode
    );

    if (!check.allowed) {
      // Admin bypass for educational demo state fixes
      if (session.roleCode !== "ADMIN") {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }
    }

    // 2. Update Application Status
    const updatedApp = await db.application.update({
      where: { id },
      data: {
        status: targetStatus,
        rejectionReason: action === "REJECT" ? reason : application.rejectionReason,
        requestedInfo: action === "REQUEST_INFO" ? message : application.requestedInfo,
      },
    });

    // 3. Status History
    await db.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: application.status,
        toStatus: targetStatus,
        changedById: session.id,
        comment: commentText,
      },
    });

    // 4. If APPROVED, Automatically Issue Digital License Certificate
    if (action === "APPROVE") {
      const count = await db.license.count();
      const certId = `CERT-${id.replace("LIC-2026-", "")}-${Math.floor(100 + Math.random() * 900)}`;
      const licenseKey = `${application.software.name.substring(0, 5).toUpperCase()}-2026-${certId.substring(5)}-99X`;

      const durationYears = parseInt(application.licenseDuration) || 1;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + durationYears);

      issuedLicense = await db.license.create({
        data: {
          id: certId,
          applicationId: id,
          softwareId: application.softwareId,
          userId: application.userId,
          licenseType: application.licenseType,
          licenseKey,
          issuedAt: new Date(),
          expiresAt,
          status: "ACTIVE",
          qrCodeVerificationUrl: `http://localhost:3000/verify-license?id=${certId}`,
        },
      });

      // Update App state to LICENSE_ISSUED
      await db.application.update({
        where: { id },
        data: { status: "LICENSE_ISSUED" },
      });

      await db.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: "APPROVED",
          toStatus: "LICENSE_ISSUED",
          changedById: session.id,
          comment: `Issued digital certificate ${certId}`,
        },
      });

      await db.licenseEvent.create({
        data: {
          licenseId: issuedLicense.id,
          eventType: "ISSUED",
          performedById: session.id,
          reason: "Approved after audit verification",
        },
      });

      await notificationChannel.dispatch({
        userId: application.userId,
        type: "LICENSE_ISSUED",
        title: "License Certificate Issued!",
        message: `Your license application ${id} has been approved and certificate ${certId} issued.`,
        link: `/dashboard/licenses/${certId}`,
      });
    } else if (action === "REJECT") {
      await notificationChannel.dispatch({
        userId: application.userId,
        type: "APPLICATION_REJECTED",
        title: "Application Rejected",
        message: `Application ${id} rejected: ${reason}`,
        link: `/dashboard/applications/${id}`,
      });
    } else if (action === "REQUEST_INFO") {
      await notificationChannel.dispatch({
        userId: application.userId,
        type: "INFO_REQUESTED",
        title: "Additional Information Requested",
        message: `Reviewer requested update for ${id}: ${message}`,
        link: `/dashboard/applications/${id}`,
      });
    }

    // Audit Log
    await db.activityLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: `APPLICATION_${action}`,
        entity: "Application",
        entityId: id,
        details: commentText,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
      license: issuedLicense,
    });
  } catch (err) {
    console.error("Review API error:", err);
    return NextResponse.json({ error: "Internal server error during review decision" }, { status: 500 });
  }
}
