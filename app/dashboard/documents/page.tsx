import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DocumentsClientView, DocumentRow } from "@/components/dashboard/DocumentsClientView";

export default async function UserDocumentsPage() {
  const session = await getSession();
  if (!session) return null;

  const docs = await db.applicationDocument.findMany({
    where: { application: { userId: session.id } },
    include: { application: { include: { software: true } } },
    orderBy: { uploadedAt: "desc" },
  });

  const formattedData: DocumentRow[] = docs.map((d) => ({
    id: d.id,
    originalName: d.originalName,
    softwareName: d.application.software.name,
    sizeMB: `${(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
    checksum: d.checksumSha256,
    uploadedAt: new Date(d.uploadedAt).toLocaleDateString(),
    fileUrl: d.fileUrl,
  }));

  return <DocumentsClientView documents={formattedData} />;
}
