import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Auth check
    if (app.userId !== session.id && session.roleCode === "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(app);
  } catch (err) {
    console.error("GET application error:", err);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}
