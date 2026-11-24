import React from "react";
import { getSession } from "@/lib/auth";
import { AdminSettingsClientView } from "@/components/admin/AdminSettingsClientView";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) return null;

  return <AdminSettingsClientView />;
}
