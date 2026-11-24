import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationChannel } from "@/services/notification/NotificationChannel";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.roleCode !== "ADMIN" &&
        session.roleCode !== "LICENSE_MANAGER" &&
        session.roleCode !== "REVIEWER")
    ) {
      return NextResponse.json(
        { error: "Forbidden: Admin or License Manager role required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { action, reason, extendMonths } = await req.json();

    const license = await db.license.findUnique({
      where: { id },
      include: { user: true, software: true },
    });

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    let newStatus = license.status;
    let newExpiresAt = license.expiresAt;
    let eventType = "UPDATED";

    if (action === "SUSPEND") {
      newStatus = "SUSPENDED";
      eventType = "SUSPENDED";
    } else if (action === "REINSTATE") {
      newStatus = "ACTIVE";
      eventType = "REINSTATED";
    } else if (action === "REVOKE") {
      newStatus = "REVOKED";
      eventType = "REVOKED";
    } else if (action === "EXTEND") {
      const months = Number(extendMonths) || 12;
      const currentExpiry = new Date(license.expiresAt);
      currentExpiry.setMonth(currentExpiry.getMonth() + months);
      newExpiresAt = currentExpiry;
      newStatus = "ACTIVE";
      eventType = "EXTENDED";
    } else {
      return NextResponse.json({ error: "Invalid license action" }, { status: 400 });
    }

    const updatedLicense = await db.license.update({
      where: { id },
      data: {
        status: newStatus,
        expiresAt: newExpiresAt,
      },
    });

    await db.licenseEvent.create({
      data: {
        licenseId: id,
        eventType,
        performedById: session.id,
        reason: reason || `License state changed to ${newStatus}`,
      },
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: `LICENSE_${eventType}`,
        entity: "License",
        entityId: id,
        details: `License ${id} set to ${newStatus}`,
      },
    });

    await notificationChannel.dispatch({
      userId: license.userId,
      type: "EXPIRATION_WARNING",
      title: `License Status Updated: ${newStatus}`,
      message: `Your license ${id} for ${license.software.name} status is now ${newStatus}.`,
      link: `/dashboard/licenses/${id}`,
    });

    return NextResponse.json({
      success: true,
      license: updatedLicense,
    });
  } catch (error) {
    console.error("Admin license update error:", error);
    return NextResponse.json(
      { error: "Internal server error updating license" },
      { status: 500 }
    );
  }
}
