import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminActivityClientView, AdminActivityRow } from "@/components/admin/AdminActivityClientView";

export default async function AdminAuditLogPage() {
  const session = await getSession();
  if (!session) return null;

  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const formattedData: AdminActivityRow[] = logs.map((l) => ({
    id: l.id,
    userEmail: l.userEmail || "System Anonymous",
    action: l.action,
    entity: `${l.entity} (${l.entityId || "N/A"})`,
    details: l.details || "N/A",
    ipAddress: l.ipAddress || "127.0.0.1",
    timestamp: new Date(l.createdAt).toLocaleString(),
  }));

  return <AdminActivityClientView logs={formattedData} />;
}
