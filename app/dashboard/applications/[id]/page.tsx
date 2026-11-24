import React from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationDetailClientView } from "@/components/dashboard/ApplicationDetailClientView";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;

  const app = await db.application.findUnique({
    where: { id },
    include: {
      software: true,
      user: true,
      documents: true,
      digitalSignature: true,
      license: true,
      statusHistory: {
        include: { changedBy: true },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!app) notFound();

  // Authorization check
  if (app.userId !== session.id && session.roleCode === "USER") {
    notFound();
  }

  return <ApplicationDetailClientView app={app as any} />;
}
