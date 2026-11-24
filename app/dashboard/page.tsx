import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardOverviewClientView } from "@/components/dashboard/DashboardOverviewClientView";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalLicenses,
    activeLicenses,
    expiringLicenses,
    totalApps,
    pendingApps,
    requireActionCount,
    totalSoftware,
    recentLicenses,
    recentApplications,
    recentActivity,
  ] = await Promise.all([
    db.license.count({ where: { userId: session.id } }),
    db.license.count({ where: { userId: session.id, status: "ACTIVE" } }),
    db.license.count({
      where: {
        userId: session.id,
        OR: [
          { status: "EXPIRING_SOON" },
          { expiresAt: { lte: thirtyDaysFromNow, gte: now } },
        ],
      },
    }),
    db.application.count({ where: { userId: session.id } }),
    db.application.count({
      where: {
        userId: session.id,
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    }),
    db.application.count({
      where: {
        userId: session.id,
        status: { in: ["DOCUMENTS_REQUIRED", "ADDITIONAL_INFO_REQUIRED", "DRAFT"] },
      },
    }),
    db.software.count({ where: { userId: session.id } }),
    db.license.findMany({
      where: { userId: session.id },
      include: { software: true },
      orderBy: { issuedAt: "desc" },
      take: 5,
    }),
    db.application.findMany({
      where: { userId: session.id },
      include: { software: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.activityLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <DashboardOverviewClientView
      session={{
        name: session.name,
        roleName: session.roleName,
      }}
      metrics={{
        totalLicenses,
        activeLicenses,
        expiringLicenses,
        totalApps,
        pendingApps,
        requireActionCount,
        totalSoftware,
      }}
      recentLicenses={recentLicenses.map((lic) => ({
        id: lic.id,
        softwareName: lic.software.name,
        licenseKey: lic.licenseKey,
        licenseType: lic.licenseType,
        status: lic.status,
        expiresAt: lic.expiresAt.toISOString(),
      }))}
      recentApplications={recentApplications.map((app) => ({
        id: app.id,
        softwareName: app.software.name,
        licenseType: app.licenseType,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      }))}
      recentActivity={recentActivity.map((act) => ({
        id: act.id,
        action: act.action,
        details: act.details,
        entity: act.entity,
        createdAt: act.createdAt.toISOString(),
      }))}
    />
  );
}
