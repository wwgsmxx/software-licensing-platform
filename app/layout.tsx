import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { LanguageProvider } from "@/lib/LanguageContext";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FleXora — Enterprise Software Licensing & Digital Signature Platform",
  description:
    "Unified B2B SaaS platform for automated software licensing, Ed25519 cryptographic signatures, and instant authenticity verification.",
  keywords: [
    "FleXora",
    "software licensing",
    "digital signature",
    "Ed25519",
    "SHA-256",
    "SaaS platform",
    "license verification",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <LanguageProvider>
          <ToastProvider>
            <DemoBanner />
            <Header currentUser={session} />
            <CommandPalette />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
