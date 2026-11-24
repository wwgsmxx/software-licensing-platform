import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSoftwareClientView, AdminSoftwareRow } from "@/components/admin/AdminSoftwareClientView";

export default async function AdminSoftwarePage() {
  const session = await getSession();
  if (!session) return null;

  const softwareList = await db.software.findMany({
    include: { user: true, _count: { select: { applications: true, licenses: true } } },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: AdminSoftwareRow[] = softwareList.map((sw) => ({
    id: sw.id,
    name: sw.name,
    version: `v${sw.version}`,
    developer: sw.developer,
    applicant: sw.user.name,
    softwareType: sw.softwareType,
    platform: sw.platform,
    applicationsCount: sw._count.applications,
    licensesCount: sw._count.licenses,
    createdAt: new Date(sw.createdAt).toLocaleDateString(),
  }));

  return <AdminSoftwareClientView softwareList={formattedData} />;
}
