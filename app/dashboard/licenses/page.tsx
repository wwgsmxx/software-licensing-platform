import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LicensesClientView, LicenseRow } from "@/components/dashboard/LicensesClientView";

export default async function UserLicensesPage() {
  const session = await getSession();
  if (!session) return null;

  const licenses = await db.license.findMany({
    where: { userId: session.id },
    include: { software: true, application: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: LicenseRow[] = licenses.map((lic) => ({
    id: lic.id,
    licenseKey: lic.licenseKey,
    softwareName: lic.software.name,
    version: `v${lic.software.version}`,
    licenseType: lic.licenseType,
    status: lic.status,
    issuedAt: new Date(lic.issuedAt).toLocaleDateString(),
    expiresAt: new Date(lic.expiresAt).toLocaleDateString(),
  }));

  return <LicensesClientView licenses={formattedData} />;
}
