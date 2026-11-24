import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminOverviewClientView } from "@/components/admin/AdminOverviewClientView";

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  const [
    totalUsers,
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    activeLicenses,
    reviewQueue,
    recentActivity,
  ] = await Promise.all([
    db.user.count(),
    db.application.count(),
    db.application.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "ADDITIONAL_INFO_REQUIRED"] } },
    }),
    db.application.count({ where: { status: "APPROVED" } }),
    db.application.count({ where: { status: "REJECTED" } }),
    db.license.count({ where: { status: "ACTIVE" } }),
    db.application.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "ADDITIONAL_INFO_REQUIRED"] } },
      include: { software: true, user: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <AdminOverviewClientView
      metrics={{
        totalUsers,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        activeLicenses,
      }}
      reviewQueue={reviewQueue.map((app) => ({
        id: app.id,
        applicantName: app.user.name,
        softwareName: app.software.name,
        status: app.status,
      }))}
      recentActivity={recentActivity.map((act) => ({
        id: act.id,
        action: act.action,
        userEmail: act.userEmail,
        details: act.details,
        entity: act.entity,
        createdAt: act.createdAt.toISOString(),
      }))}
    />
  );
}
