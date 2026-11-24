import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ActivityClientView, ActivityRow } from "@/components/dashboard/ActivityClientView";

export default async function UserActivityPage() {
  const session = await getSession();
  if (!session) return null;

  const logs = await db.activityLog.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedData: ActivityRow[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entity: `${l.entity} (${l.entityId || "N/A"})`,
    details: l.details || "No additional details",
    ipAddress: l.ipAddress || "127.0.0.1",
    timestamp: new Date(l.createdAt).toLocaleString(),
  }));

  return <ActivityClientView logs={formattedData} />;
}
