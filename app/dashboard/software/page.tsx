import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SoftwareClientView, SoftwareRow } from "@/components/dashboard/SoftwareClientView";

export default async function UserSoftwarePage() {
  const session = await getSession();
  if (!session) return null;

  const softwareList = await db.software.findMany({
    where: { userId: session.id },
    include: { _count: { select: { applications: true, licenses: true } } },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: SoftwareRow[] = softwareList.map((sw) => ({
    id: sw.id,
    name: sw.name,
    version: `v${sw.version}`,
    developer: sw.developer,
    softwareType: sw.softwareType,
    platform: sw.platform,
    applicationsCount: sw._count.applications,
    licensesCount: sw._count.licenses,
    createdAt: new Date(sw.createdAt).toLocaleDateString(),
  }));

  return <SoftwareClientView softwareList={formattedData} />;
}
