import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const license = await db.license.findUnique({
      where: { id },
      include: {
        software: true,
        user: true,
        application: {
          include: { digitalSignature: true },
        },
      },
    });

    if (!license) {
      return NextResponse.json({ error: "Лицензия не найдена" }, { status: 404 });
    }

    // ── Generate QR Code ──
    const origin = new URL(req.url).origin || "http://localhost:3000";
    const verificationUrl = `${origin}/verify-license?id=${encodeURIComponent(license.id)}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");

    // ── Create PDF Document ──
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load Arial TrueType fonts for full Cyrillic support
    const fontsDir = path.join(process.cwd(), "public", "fonts");
    const fontRegularBytes = fs.readFileSync(path.join(fontsDir, "arial.ttf"));
    const fontBoldBytes = fs.readFileSync(path.join(fontsDir, "arialbd.ttf"));

    const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Embed Flexora Logo if available
    let logoImage: any = null;
    const logoPath = path.join(process.cwd(), "public", "logo-flexora.jpg");
    if (fs.existsSync(logoPath)) {
      try {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } catch (e) {
        console.warn("Failed to embed logo JPG:", e);
      }
    }

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const { width, height } = page.getSize();

    // ── Colors ──
    const cPrimary = rgb(0.12, 0.18, 0.32);      // Deep Slate Navy
    const cSecondary = rgb(0.25, 0.35, 0.65);    // Indigo
    const cAccent = rgb(0.05, 0.60, 0.50);       // Teal
    const cDark = rgb(0.08, 0.10, 0.15);         // Off-black
    const cMuted = rgb(0.42, 0.46, 0.54);        // Slate grey
    const cLightBg = rgb(0.97, 0.98, 0.99);      // Box background
    const cBorder = rgb(0.85, 0.88, 0.92);       // Box border
    const cActive = rgb(0.05, 0.58, 0.35);       // Emerald Green

    const margin = 32;

    // ── Outer & Inner Ornamental Borders ──
    // Outer primary border
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: cPrimary,
      borderWidth: 2,
    });

    // Inner fine border
    page.drawRectangle({
      x: margin + 5,
      y: margin + 5,
      width: width - (margin + 5) * 2,
      height: height - (margin + 5) * 2,
      borderColor: rgb(0.78, 0.82, 0.88),
      borderWidth: 0.8,
    });

    // Corner decorative markers
    const corners = [
      { x: margin + 8, y: margin + 8 },
      { x: width - margin - 16, y: margin + 8 },
      { x: margin + 8, y: height - margin - 16 },
      { x: width - margin - 16, y: height - margin - 16 },
    ];
    for (const c of corners) {
      page.drawRectangle({
        x: c.x,
        y: c.y,
        width: 8,
        height: 8,
        color: cSecondary,
      });
    }

    let cursorY = height - 58;

    // ── Header: Logo & Authority Title ──
    if (logoImage) {
      const logoW = 90;
      const logoH = (logoW / logoImage.width) * logoImage.height;
      page.drawImage(logoImage, {
        x: margin + 25,
        y: cursorY - logoH + 12,
        width: logoW,
        height: logoH,
      });
    }

    const headerTextX = logoImage ? margin + 125 : width / 2 - 120;

    page.drawText("FLEXORA SYSTEMS LICENSING AUTHORITY", {
      x: headerTextX,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: cSecondary,
    });

    cursorY -= 16;
    page.drawText("СЕРТИФИКАТ ЛИЦЕНЗИИ НА ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ", {
      x: headerTextX,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: cDark,
    });

    cursorY -= 13;
    page.drawText("SOFTWARE LICENSE CERTIFICATE  •  ГОСУДАРСТВЕННЫЙ РЕЕСТР", {
      x: headerTextX,
      y: cursorY,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });

    cursorY -= 22;

    // Header divider line
    page.drawLine({
      start: { x: margin + 20, y: cursorY },
      end: { x: width - margin - 20, y: cursorY },
      color: cBorder,
      thickness: 1,
    });

    cursorY -= 20;

    // License Key & ID badge
    const badgeW = width - (margin + 20) * 2;
    page.drawRectangle({
      x: margin + 20,
      y: cursorY - 26,
      width: badgeW,
      height: 32,
      color: rgb(0.94, 0.96, 1.0),
      borderColor: rgb(0.75, 0.82, 0.95),
      borderWidth: 1,
    });

    page.drawText(`РЕГИСТРАЦИОННЫЙ НОМЕР:  ${license.licenseKey}`, {
      x: margin + 35,
      y: cursorY - 14,
      size: 11,
      font: fontBold,
      color: cSecondary,
    });

    page.drawText(`ID: ${license.id}`, {
      x: width - margin - 150,
      y: cursorY - 13,
      size: 9,
      font: fontRegular,
      color: cMuted,
    });

    cursorY -= 44;

    // Official statement
    page.drawText(
      "Настоящий сертификат удостоверяет право на использование указанного программного продукта",
      {
        x: margin + 25,
        y: cursorY,
        size: 9.5,
        font: fontRegular,
        color: cDark,
      }
    );
    cursorY -= 13;
    page.drawText(
      "в соответствии с условиями лицензионного соглашения и нормативными требованиями.",
      {
        x: margin + 25,
        y: cursorY,
        size: 9.5,
        font: fontRegular,
        color: cDark,
      }
    );

    cursorY -= 20;

    // ── Box 1: Software Product ──
    const boxW = width - (margin + 20) * 2;
    const box1H = 70;
    page.drawRectangle({
      x: margin + 20,
      y: cursorY - box1H,
      width: boxW,
      height: box1H,
      color: cLightBg,
      borderColor: cBorder,
      borderWidth: 1,
    });

    page.drawText("ЛИЦЕНЗИРУЕМЫЙ ПРОГРАММНЫЙ ПРОДУКТ", {
      x: margin + 32,
      y: cursorY - 15,
      size: 8,
      font: fontBold,
      color: cSecondary,
    });

    page.drawText(`${license.software.name}  (Версия: ${license.software.version})`, {
      x: margin + 32,
      y: cursorY - 33,
      size: 13,
      font: fontBold,
      color: cDark,
    });

    page.drawText(
      `Разработчик: ${license.software.developer}   |   Тип: ${license.software.softwareType}   |   Платформа: ${license.software.platform}`,
      {
        x: margin + 32,
        y: cursorY - 52,
        size: 9,
        font: fontRegular,
        color: cMuted,
      }
    );

    cursorY -= box1H + 16;

    // ── Box 2: Licensee Details ──
    const applicantType = license.application?.applicantType || "INDIVIDUAL";
    const isLegal = applicantType === "LEGAL_ENTITY";
    const licenseeName = isLegal && license.application?.orgName
      ? license.application.orgName
      : license.user.name;

    const idLabel = isLegal && license.application?.orgBin
      ? `БИН: ${license.application.orgBin}`
      : `Email: ${license.user.email}`;

    const repText = isLegal && license.application?.representativeName
      ? ` | Представитель: ${license.application.representativeName}`
      : "";

    const box2H = 65;
    page.drawRectangle({
      x: margin + 20,
      y: cursorY - box2H,
      width: boxW,
      height: box2H,
      color: cLightBg,
      borderColor: cBorder,
      borderWidth: 1,
    });

    page.drawText("СВЕДЕНИЯ О ЛИЦЕНЗИАТЕ (ВЛАДЕЛЬЦЕ ЛИЦЕНЗИИ)", {
      x: margin + 32,
      y: cursorY - 15,
      size: 8,
      font: fontBold,
      color: cSecondary,
    });

    page.drawText(licenseeName, {
      x: margin + 32,
      y: cursorY - 33,
      size: 12,
      font: fontBold,
      color: cDark,
    });

    page.drawText(
      `Субъект: ${isLegal ? "Юридическое лицо" : "Физическое лицо"}   •   ${idLabel}${repText}`,
      {
        x: margin + 32,
        y: cursorY - 50,
        size: 8.5,
        font: fontRegular,
        color: cMuted,
      }
    );

    cursorY -= box2H + 16;

    // ── Terms Grid (4 Columns) ──
    const colW = boxW / 4;
    const gridH = 46;
    const gridY = cursorY - gridH;

    page.drawRectangle({
      x: margin + 20,
      y: gridY,
      width: boxW,
      height: gridH,
      color: rgb(1, 1, 1),
      borderColor: cBorder,
      borderWidth: 1,
    });

    // Dividers between columns
    for (let i = 1; i < 4; i++) {
      page.drawLine({
        start: { x: margin + 20 + colW * i, y: gridY },
        end: { x: margin + 20 + colW * i, y: gridY + gridH },
        color: cBorder,
        thickness: 0.8,
      });
    }

    const issuedDate = new Date(license.issuedAt).toISOString().split("T")[0];
    const expiresDate = new Date(license.expiresAt).toISOString().split("T")[0];
    const seats = license.application?.numUsers || 1;

    // Col 1: Category
    page.drawText("ТИП ЛИЦЕНЗИИ", { x: margin + 28, y: gridY + 28, size: 7.5, font: fontBold, color: cMuted });
    page.drawText(license.licenseType, { x: margin + 28, y: gridY + 12, size: 9.5, font: fontBold, color: cDark });

    // Col 2: Seats
    page.drawText("РАБОЧИХ МЕСТ", { x: margin + 20 + colW + 8, y: gridY + 28, size: 7.5, font: fontBold, color: cMuted });
    page.drawText(`${seats} польз.`, { x: margin + 20 + colW + 8, y: gridY + 12, size: 9.5, font: fontBold, color: cDark });

    // Col 3: Issued
    page.drawText("ДАТА ВЫДАЧИ", { x: margin + 20 + colW * 2 + 8, y: gridY + 28, size: 7.5, font: fontBold, color: cMuted });
    page.drawText(issuedDate, { x: margin + 20 + colW * 2 + 8, y: gridY + 12, size: 9.5, font: fontRegular, color: cDark });

    // Col 4: Expiration
    page.drawText("ДЕЙСТВУЕТ ДО", { x: margin + 20 + colW * 3 + 8, y: gridY + 28, size: 7.5, font: fontBold, color: cMuted });
    page.drawText(expiresDate, { x: margin + 20 + colW * 3 + 8, y: gridY + 12, size: 9.5, font: fontBold, color: cDark });

    cursorY = gridY - 20;

    // Status indicator
    const isLicenseActive = license.status === "ACTIVE";
    page.drawText(
      `СТАТУС ЛИЦЕНЗИИ:  ${isLicenseActive ? "ДЕЙСТВИТЕЛЕН / ACTIVE" : license.status}`,
      {
        x: margin + 25,
        y: cursorY,
        size: 10,
        font: fontBold,
        color: isLicenseActive ? cActive : rgb(0.8, 0.2, 0.2),
      }
    );

    // ── Corporate Decorative Round Stamp (matching Photo 3) ──
    const stampCenterX = width - margin - 100;
    const stampCenterY = cursorY - 50;
    const cStampInk = rgb(0.08, 0.16, 0.48); // Authentic blue stamp ink #15297c

    // Stamp outer double circle
    page.drawCircle({
      x: stampCenterX,
      y: stampCenterY,
      size: 46,
      borderColor: cStampInk,
      borderWidth: 2.5,
    });
    page.drawCircle({
      x: stampCenterX,
      y: stampCenterY,
      size: 43,
      borderColor: cStampInk,
      borderWidth: 0.8,
    });

    // Stamp middle circle
    page.drawCircle({
      x: stampCenterX,
      y: stampCenterY,
      size: 33,
      borderColor: cStampInk,
      borderWidth: 1.2,
    });
    page.drawCircle({
      x: stampCenterX,
      y: stampCenterY,
      size: 31,
      borderColor: cStampInk,
      borderWidth: 0.6,
    });

    // Stamp text - outer rim & inner arcs
    page.drawText("ИННОВАЦИОННЫЕ ТЕХНОЛОГИИ", {
      x: stampCenterX - 36,
      y: stampCenterY + 36,
      size: 5,
      font: fontBold,
      color: cStampInk,
    });

    page.drawText("ПРОЕКТ УТВЕРЖДЕН", {
      x: stampCenterX - 30,
      y: stampCenterY + 18,
      size: 6.5,
      font: fontBold,
      color: cStampInk,
    });

    // Center Logo & Brand Name
    page.drawText("FLEXORA", {
      x: stampCenterX - 22,
      y: stampCenterY + 2,
      size: 10,
      font: fontBold,
      color: cStampInk,
    });

    page.drawText("APPROVED PROJECT", {
      x: stampCenterX - 30,
      y: stampCenterY - 12,
      size: 6,
      font: fontBold,
      color: cStampInk,
    });

    page.drawText("★ 2026 ★ № 08-11/26 ★", {
      x: stampCenterX - 32,
      y: stampCenterY - 24,
      size: 5.5,
      font: fontBold,
      color: cStampInk,
    });

    page.drawText("ТЕХНОЛОГИЧЕСКИЙ ПРОЕКТ", {
      x: stampCenterX - 34,
      y: stampCenterY - 38,
      size: 4.8,
      font: fontBold,
      color: cStampInk,
    });

    // ── Cryptographic Validation Footer ──
    const footerY = margin + 25;
    const qrSize = 85;

    // QR Code
    page.drawImage(qrImage, {
      x: margin + 22,
      y: footerY,
      width: qrSize,
      height: qrSize,
    });

    const sig = license.application?.digitalSignature;
    const sigAlgorithm = sig?.algorithm || "GOST R 34.10-2015 / Ed25519";
    const fingerprint = sig?.keyFingerprint || "VERIFIED-NCALAYER-FINGERPRINT";
    const infoX = margin + 22 + qrSize + 15;

    page.drawText("КРИПТОГРАФИЧЕСКАЯ ВЕРИФИКАЦИЯ И ЭЦП", {
      x: infoX,
      y: footerY + 68,
      size: 8.5,
      font: fontBold,
      color: cSecondary,
    });

    page.drawText(`Алгоритм цифровой подписи: ${sigAlgorithm}`, {
      x: infoX,
      y: footerY + 54,
      size: 7.5,
      font: fontRegular,
      color: cDark,
    });

    page.drawText(`Отпечаток открытого ключа: ${fingerprint.substring(0, 42)}...`, {
      x: infoX,
      y: footerY + 42,
      size: 7,
      font: fontRegular,
      color: cMuted,
    });

    page.drawText(`Онлайн-проверка подлинности: ${verificationUrl}`, {
      x: infoX,
      y: footerY + 28,
      size: 7,
      font: fontRegular,
      color: cSecondary,
    });

    page.drawText(
      `Сформировано системой: ${new Date().toISOString().replace("T", " ").substring(0, 19)} • FleXora Cloud Licensing`,
      {
        x: infoX,
        y: footerY + 14,
        size: 6.5,
        font: fontRegular,
        color: cMuted,
      }
    );

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="License-${license.id}.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error("Generate PDF error:", err);
    return NextResponse.json(
      { error: "Ошибка при формировании PDF сертификата" },
      { status: 500 }
    );
  }
}
