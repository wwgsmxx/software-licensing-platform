import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message fields are required." },
        { status: 400 }
      );
    }

    const contactMsg = await db.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || "General Inquiry",
        message,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      messageId: contactMsg.id,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error submitting contact message." },
      { status: 500 }
    );
  }
}
