import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificateViewer } from "@/components/ui/CertificateViewer";

export default async function LicenseCertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;

  const license = await db.license.findUnique({
    where: { id },
    include: {
      software: true,
      user: true,
      application: {
        include: { digitalSignature: true },
      },
    },
  });

  if (!license) notFound();

  // Auth guard: User can only view their own license unless admin
  if (license.userId !== session.id && session.roleCode === "USER") {
    notFound();
  }

  const certificatePayload = {
    id: license.id,
    licenseKey: license.licenseKey,
    licenseType: license.licenseType,
    status: license.status,
    issuedAt: license.issuedAt,
    expiresAt: license.expiresAt,
    software: {
      name: license.software.name,
      version: license.software.version,
      developer: license.software.developer,
      softwareType: license.software.softwareType,
      platform: license.software.platform,
    },
    user: {
      name: license.user.name,
      email: license.user.email,
    },
    application: {
      applicantType: license.application?.applicantType || "INDIVIDUAL",
      orgName: license.application?.orgName,
      orgBin: license.application?.orgBin,
      representativeName: license.application?.representativeName,
      numUsers: license.application?.numUsers || 1,
      licenseDuration: license.application?.licenseDuration || "1 Year",
    },
    digitalSignature: license.application.digitalSignature
      ? {
          payloadHash: license.application.digitalSignature.payloadHash,
          keyFingerprint: license.application.digitalSignature.keyFingerprint,
          algorithm: license.application.digitalSignature.algorithm,
          signatureType: license.application.digitalSignature.signatureType,
          signerName: license.application.digitalSignature.signerName,
          signerIin: license.application.digitalSignature.signerIin,
          signerBin: license.application.digitalSignature.signerBin,
          verificationId: license.application.digitalSignature.verificationId,
          signedAt: license.application.digitalSignature.signedAt,
        }
      : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="print:hidden">
        <Link
          href="/dashboard/licenses"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Licenses
        </Link>
      </div>

      <CertificateViewer license={certificatePayload} />
    </div>
  );
}
