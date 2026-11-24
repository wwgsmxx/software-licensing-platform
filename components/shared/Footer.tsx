"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Logo } from "@/components/shared/Logo";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200/80 bg-white text-xs text-slate-600 pt-12 pb-8 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Col 1 — Brand / Authority */}
          <div className="space-y-3">
            <Logo size="sm" href="/" showTagline={false} />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {t("footerDesc")}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t("securityStatusDesc")}
            </div>
          </div>

          {/* Col 2 — Services & Platform */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {t("footerServices")}
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href="/verify-license" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {t("footerVerify")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-indigo-600 transition-colors">
                  {t("footerHowItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-indigo-600 transition-colors">
                  {t("footerFaq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Contacts & Support */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {t("footerContacts")}
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href="/#contact" className="hover:text-indigo-600 transition-colors font-medium">
                  {t("footerContact")}
                </Link>
              </li>
              <li>
                <Link href="/#capabilities" className="hover:text-indigo-600 transition-colors">
                  {t("footerAbout")}
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href="mailto:support@flexora.io"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>support@flexora.io</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {t("footerCopyright")}</p>
          <div className="flex items-center gap-4">
            <span>{t("footerBuiltWith")}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-400">Ed25519 & SHA-256 Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
