import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    if (!queryId || !queryId.trim()) {
      return NextResponse.json(
        { found: false, message: "Certificate ID parameter is required." },
        { status: 400 }
      );
    }

    const idStr = queryId.trim();

    const license = await db.license.findFirst({
      where: {
        OR: [
          { id: { equals: idStr } },
          { licenseKey: { equals: idStr } },
          { applicationId: { equals: idStr } },
        ],
      },
      include: {
        software: true,
        user: true,
        application: {
          include: { digitalSignature: true },
        },
      },
    });

    if (!license) {
      return NextResponse.json({
        found: false,
        message: `No active license record found matching ID '${idStr}'.`,
      });
    }

    const isExpired = new Date() > new Date(license.expiresAt) && license.status === "ACTIVE";
    const currentStatus = isExpired ? "EXPIRED" : license.status;

    return NextResponse.json({
      found: true,
      license: {
        id: license.id,
        licenseKey: license.licenseKey,
        licenseType: license.licenseType,
        status: currentStatus,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        applicantType: license.application?.applicantType || "INDIVIDUAL",
        licenseeName:
          license.application?.applicantType === "LEGAL_ENTITY" && license.application?.orgName
            ? license.application.orgName
            : license.user.name,
        orgBin: license.application?.orgBin || null,
        numUsers: license.application?.numUsers || 1,
        software: {
          name: license.software.name,
          version: license.software.version,
          developer: license.software.developer,
          softwareType: license.software.softwareType,
          platform: license.software.platform,
        },
        digitalSignature: license.application.digitalSignature
          ? {
              keyFingerprint: license.application.digitalSignature.keyFingerprint,
              algorithm: license.application.digitalSignature.algorithm,
              verificationId: license.application.digitalSignature.verificationId,
              isVerified: license.application.digitalSignature.isVerified,
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error("License verification API error:", error);
    return NextResponse.json(
      { found: false, message: "Server error occurred while verifying license." },
      { status: 500 }
    );
  }
}
