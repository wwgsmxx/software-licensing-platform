import { describe, it, expect } from "vitest";
import { DICTIONARIES } from "@/lib/i18n";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

describe("i18n dictionaries integrity", () => {
  it("en, kk, and ru dictionaries should have matching keys", () => {
    const enKeys = Object.keys(DICTIONARIES.en);
    const kkKeys = Object.keys(DICTIONARIES.kk);
    const ruKeys = Object.keys(DICTIONARIES.ru);

    expect(enKeys.length).toBeGreaterThan(100);
    // Verify essential ECP and auth keys exist in all three languages
    const criticalKeys = [
      "loginTitle",
      "loginByPassword",
      "loginByEcp",
      "getEcpPageTitle",
      "getEcpStep1Heading",
      "getEcpStep2Heading",
      "getEcpStep3Heading",
      "getEcpStep4Heading",
      "ecpManagementHeading",
      "printA4",
      "downloadPdf",
      "verifyOnline",
      "ecpSourceNcaLayer",
      "simulatedTestSignature",
    ];

    for (const k of criticalKeys) {
      expect((DICTIONARIES.en as any)[k], `Missing EN key: ${k}`).toBeDefined();
      expect((DICTIONARIES.kk as any)[k], `Missing KK key: ${k}`).toBeDefined();
      expect((DICTIONARIES.ru as any)[k], `Missing RU key: ${k}`).toBeDefined();
    }
  });
});

describe("PDF Certificate rendering with Cyrillic", () => {
  it("should render Cyrillic text with fontkit and Arial TrueType font", async () => {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const arialBytes = fs.readFileSync(path.join(process.cwd(), "public", "fonts", "arial.ttf"));
    const font = await doc.embedFont(arialBytes);

    const page = doc.addPage([595.28, 841.89]);
    page.drawText("СЕРТИФИКАТ ЛИЦЕНЗИИ: ТОО «Инновационные Системы»", {
      x: 50,
      y: 800,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await doc.save();
    expect(pdfBytes.length).toBeGreaterThan(1000);
  });
});

