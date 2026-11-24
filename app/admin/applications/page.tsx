import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminApplicationsClientView, AdminApplicationRow } from "@/components/admin/AdminApplicationsClientView";

export default async function AdminApplicationsQueuePage() {
  const session = await getSession();
  if (!session) return null;

  const applications = await db.application.findMany({
    include: {
      software: true,
      user: true,
      digitalSignature: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: AdminApplicationRow[] = applications.map((app) => ({
    id: app.id,
    applicantName: app.user.name,
    applicantEmail: app.user.email,
    softwareName: app.software.name,
    licenseType: app.licenseType,
    status: app.status,
    submittedDate: new Date(app.createdAt).toLocaleDateString(),
    signatureVerified: app.digitalSignature ? app.digitalSignature.isVerified : false,
  }));

  return <AdminApplicationsClientView applications={formattedData} />;
}
