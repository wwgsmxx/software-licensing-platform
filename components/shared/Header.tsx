"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Globe,
  ChevronDown,
  Check,
  Layers,
  FileText,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";
import { Logo } from "@/components/shared/Logo";

export interface HeaderProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    roleCode: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { locale, setLocale, t, supportedLocales, currentLocaleInfo } = useLanguage();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/verify-license");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── FleXora SaaS Logo ── */}
        <Logo size="md" href="/" />

        {/* ── Main Navigation (Context-sensitive: Public vs Dashboard) ── */}
        {isPublicPage ? (
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <Link
              href="/#hero"
              className={`hover:text-indigo-600 transition-colors py-1 ${
                pathname === "/" ? "text-indigo-600 font-bold border-b-2 border-indigo-600" : ""
              }`}
            >
              {t("navHome")}
            </Link>
            <Link
              href="/#features"
              className="hover:text-indigo-600 transition-colors py-1"
            >
              {t("navFeatures")}
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-indigo-600 transition-colors py-1"
            >
              {t("navHowItWorks")}
            </Link>
            <Link
              href="/get-ecp"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                pathname === "/get-ecp"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t("navGetEcp")}</span>
            </Link>
            <Link
              href="/verify-license"
              className={`hover:text-indigo-600 transition-colors flex items-center gap-1 py-1 ${
                pathname === "/verify-license" ? "text-indigo-600 font-bold border-b-2 border-indigo-600" : ""
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t("navVerify")}
            </Link>
            <Link
              href="/#faq"
              className="hover:text-indigo-600 transition-colors py-1"
            >
              {t("navFaq")}
            </Link>
            <Link
              href="/#contact"
              className="hover:text-indigo-600 transition-colors py-1"
            >
              {t("footerContact")}
            </Link>
            {currentUser && (
              <Link
                href={currentUser.roleCode === "ADMIN" ? "/admin" : "/dashboard"}
                className="hover:text-indigo-700 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t("navDashboard")}</span>
              </Link>
            )}
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{pathname.startsWith("/admin") ? t("navAdmin") : t("navDashboard")}</span>
            </span>
            <Link
              href="/dashboard/ecp"
              className={`hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                pathname === "/dashboard/ecp" ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200" : ""
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t("navEcpManagement")}</span>
            </Link>
            <Link
              href="/dashboard/applications/new"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
            >
              <span>+ {t("newLicenseApp")}</span>
            </Link>
          </nav>
        )}

        {/* ── Controls: Language + Auth ── */}
        <div className="flex items-center gap-2.5">

          {/* ── Language Switcher ── */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Сменить язык"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentLocaleInfo.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdown ? "rotate-180" : ""}`} />
            </button>

            {langDropdown && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-slate-200 bg-white shadow-lg p-1 z-50 text-xs">
                {supportedLocales.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => {
                      setLocale(loc.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      locale === loc.code
                        ? "bg-slate-100 text-indigo-600 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{loc.nativeName}</span>
                    {locale === loc.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick Public License Verification Button ── */}
          <Link href="/verify-license" className="hidden sm:inline-flex">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("navVerify")}</span>
            </button>
          </Link>

          {/* ── User Auth Controls: Only Login Button When Unauthenticated ── */}
          {currentUser ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="font-semibold text-slate-900 leading-tight truncate max-w-[140px]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{currentUser.roleCode}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 text-xs space-y-1">
                  <div className="p-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-slate-500 truncate text-[11px]">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-indigo-600 font-semibold text-[10px]">
                      {currentUser.roleCode}
                    </span>
                  </div>

                  {/* Direct link to public landing page */}
                  <Link
                    href="/"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>{t("navHome")} (Лендинг)</span>
                  </Link>

                  <Link
                    href={currentUser.roleCode === "ADMIN" ? "/admin" : "/dashboard"}
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{t("dashboardPortal")}</span>
                  </Link>

                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span>{t("notificationsCenter")}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-semibold px-4">{t("login")}</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white p-4 text-xs space-y-3">
          <nav className="flex flex-col gap-1">
            {[
              { href: "/#hero", label: t("navHome") },
              { href: "/#features", label: t("navFeatures") },
              { href: "/#how-it-works", label: t("navHowItWorks") },
              { href: "/get-ecp", label: `⚡ ${t("navGetEcp")}` },
              { href: "/verify-license", label: t("navVerify") },
              { href: "/#faq", label: t("navFaq") },
              { href: "/#contact", label: t("footerContact") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded transition-colors ${
                  pathname === href ? "bg-blue-50 text-indigo-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
            {currentUser && (
              <Link
                href={currentUser.roleCode === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded bg-indigo-50 text-indigo-700 font-bold"
              >
                {t("navDashboard")}
              </Link>
            )}
          </nav>

          {!currentUser && (
            <div className="pt-3 border-t border-slate-200">
              <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">{t("login")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
