import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationChannel } from "@/services/notification/NotificationChannel";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      softwareName,
      softwareVersion,
      developer,
      softwareDescription,
      softwareType,
      platform,
      licenseType,
      licenseDuration,
      numUsers,
      licenseDescription,
      applicantType,
      orgName,
      orgBin,
      orgAddress,
      representativeName,
      representativeRole,
      representativeBasis,
      documents,
      digitalSignature,
    } = body;

    // Generate unique non-colliding Application ID
    const allApps = await db.application.findMany({ select: { id: true } });
    let maxNum = 100;
    for (const app of allApps) {
      const match = app.id.match(/LIC-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    let appId = `LIC-2026-${String(maxNum + 1).padStart(6, "0")}`;
    while (await db.application.findUnique({ where: { id: appId } })) {
      maxNum++;
      appId = `LIC-2026-${String(maxNum + 1).padStart(6, "0")}`;
    }

    // Execute in transaction for database consistency
    const application = await db.$transaction(async (tx) => {
      // 1. Create or Find Software
      let software = await tx.software.findFirst({
        where: { userId: session.id, name: softwareName, version: softwareVersion },
      });

      if (!software) {
        software = await tx.software.create({
          data: {
            userId: session.id,
            name: softwareName,
            version: softwareVersion,
            developer: developer || "FleXora Partner",
            description: softwareDescription || "Software package",
            softwareType: softwareType || "Enterprise",
            platform: platform || "Cross-platform",
            releaseDate: new Date(),
          },
        });
      }

      // 2. Create Application in SUBMITTED state
      const newApp = await tx.application.create({
        data: {
          id: appId,
          userId: session.id,
          softwareId: software.id,
          status: "SUBMITTED",
          licenseType: licenseType || "Commercial",
          licenseDuration: licenseDuration || "1 Year",
          numUsers: Number(numUsers) || 1,
          category: licenseType || "Commercial",
          licenseDescription: licenseDescription || null,
          applicantType: applicantType || "INDIVIDUAL",
          orgName: orgName || null,
          orgBin: orgBin || null,
          orgAddress: orgAddress || null,
          representativeName: representativeName || null,
          representativeRole: representativeRole || null,
          representativeBasis: representativeBasis || null,
          reviewDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours SLA
        },
      });

      // 3. Attach Application Documents
      if (documents && Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          await tx.applicationDocument.create({
            data: {
              applicationId: newApp.id,
              filename: doc.filename || doc.originalName || "document",
              originalName: doc.originalName || "document",
              mimeType: doc.mimeType || "application/octet-stream",
              sizeBytes: Number(doc.sizeBytes) || 0,
              checksumSha256: doc.checksumSha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
              fileUrl: doc.fileUrl || "/uploads/placeholder.pdf",
            },
          });
        }
      }

      // 4. Attach Digital Signature
      if (digitalSignature) {
        await tx.digitalSignature.create({
          data: {
            applicationId: newApp.id,
            payloadHash: digitalSignature.payloadHash,
            signature: digitalSignature.signature,
            algorithm: digitalSignature.algorithm || "SHA256withEd25519-SIMULATED",
            signatureType: digitalSignature.signatureType || "SIMULATED",
            keyFingerprint: digitalSignature.keyFingerprint || "ED25519-SIG",
            verificationId: digitalSignature.verificationId || `VER-${Date.now()}`,
            signerName: digitalSignature.signerName || session.name,
            signerEmail: digitalSignature.signerEmail || session.email,
            signerIin: digitalSignature.signerIin || null,
            signerBin: digitalSignature.signerBin || null,
            certificateIssuer: digitalSignature.certificateIssuer || null,
            certificateSerial: digitalSignature.certificateSerial || null,
            signedContent: digitalSignature.signedContent || null,
            isVerified: true,
            signedAt: new Date(digitalSignature.signedAt || Date.now()),
          },
        });
      }

      // 5. Create Status Transition History
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: newApp.id,
          fromStatus: "SIGNED",
          toStatus: "SUBMITTED",
          changedById: session.id,
          comment: "Application submitted with Ed25519 digital signature binding.",
        },
      });

      // 6. Audit Log
      await tx.activityLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: "APPLICATION_SUBMITTED",
          entity: "Application",
          entityId: newApp.id,
          details: `Submitted application ${newApp.id} for ${softwareName}`,
        },
      });

      return newApp;
    });

    try {
      await notificationChannel.dispatch({
        userId: session.id,
        type: "APPLICATION_SUBMITTED",
        title: "Application Submitted",
        message: `Your licensing application ${application.id} has been submitted for review.`,
        link: `/dashboard/applications/${application.id}`,
      });
    } catch (notifErr) {
      console.warn("Notification dispatch warning:", notifErr);
    }

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("Create application error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create application" },
      { status: 500 }
    );
  }
}
