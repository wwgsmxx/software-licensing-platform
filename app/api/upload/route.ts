import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storageProvider } from "@/services/storage/StorageProvider";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storedResult = await storageProvider.saveFile(
      buffer,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      id: `doc-${Date.now()}`,
      filename: storedResult.filename,
      originalName: storedResult.originalName,
      mimeType: storedResult.mimeType,
      sizeBytes: storedResult.sizeBytes,
      checksumSha256: storedResult.checksumSha256,
      fileUrl: storedResult.fileUrl,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error during file upload" },
      { status: 500 }
    );
  }
}
