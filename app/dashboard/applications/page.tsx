import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationsClientView, ApplicationRow } from "@/components/dashboard/ApplicationsClientView";

export default async function UserApplicationsListPage() {
  const session = await getSession();
  if (!session) return null;

  const applications = await db.application.findMany({
    where: { userId: session.id },
    include: {
      software: true,
      digitalSignature: true,
      license: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: ApplicationRow[] = applications.map((app) => ({
    id: app.id,
    softwareName: app.software.name,
    licenseType: `${app.licenseType} (${app.licenseDuration})`,
    numUsers: app.numUsers,
    status: app.status,
    signedAt: app.digitalSignature
      ? new Date(app.digitalSignature.signedAt).toLocaleDateString()
      : "Not Signed",
    createdAt: new Date(app.createdAt).toLocaleDateString(),
  }));

  return <ApplicationsClientView applications={formattedData} />;
}
