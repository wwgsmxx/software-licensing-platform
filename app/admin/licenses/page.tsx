import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminLicensesClientView, AdminLicenseRow } from "@/components/admin/AdminLicensesClientView";

export default async function AdminLicensesPage() {
  const session = await getSession();
  if (!session) return null;

  const licenses = await db.license.findMany({
    include: { software: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: AdminLicenseRow[] = licenses.map((lic) => ({
    id: lic.id,
    licenseKey: lic.licenseKey,
    softwareName: lic.software.name,
    version: `v${lic.software.version}`,
    userName: lic.user.name,
    userEmail: lic.user.email,
    licenseType: lic.licenseType,
    status: lic.status,
    issuedAt: new Date(lic.issuedAt).toLocaleDateString(),
    expiresAt: new Date(lic.expiresAt).toLocaleDateString(),
  }));

  return <AdminLicensesClientView licenses={formattedData} />;
}
