"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Award,
  Bell,
  Activity,
  User,
  ShieldCheck,
  Users,
  Box,
  Layers,
  Sliders,
  FolderCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export interface DashboardSidebarProps {
  roleCode?: string;
  unreadCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  roleCode = "USER",
  unreadCount = 0,
}) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isAdminOrStaff = roleCode === "ADMIN" || roleCode === "REVIEWER" || roleCode === "LICENSE_MANAGER";
  const isAdminPath = pathname.startsWith("/admin");

  const USER_NAV: NavItem[] = [
    { label: t("navDashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("newLicenseApp"), href: "/dashboard/applications/new", icon: PlusCircle },
    { label: t("navEcpManagement"), href: "/dashboard/ecp", icon: ShieldCheck },
    { label: t("navApplications"), href: "/dashboard/applications", icon: FileText },
    { label: t("navLicenses"), href: "/dashboard/licenses", icon: Award },
    { label: t("navSoftware"), href: "/dashboard/software", icon: Box },
    { label: t("navDocuments"), href: "/dashboard/documents", icon: FolderCheck },
    { label: t("navNotifications"), href: "/dashboard/notifications", icon: Bell, badge: unreadCount },
    { label: t("navActivity"), href: "/dashboard/activity", icon: Activity },
    { label: t("navProfile"), href: "/dashboard/profile", icon: User },
  ];

  const ADMIN_NAV: NavItem[] = [
    { label: t("navAdminOverview"), href: "/admin", icon: LayoutDashboard },
    { label: t("adminReviewQueue"), href: "/admin/applications", icon: Layers },
    { label: t("adminLicenseManagement"), href: "/admin/licenses", icon: Award },
    { label: t("userAccounts"), href: "/admin/users", icon: Users },
    { label: t("softwareRegistry"), href: "/admin/software", icon: Box },
    { label: t("adminAuditLogs"), href: "/admin/activity", icon: Activity },
    { label: t("navSettings"), href: "/admin/settings", icon: Sliders },
  ];

  const navItems = isAdminPath ? ADMIN_NAV : USER_NAV;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4 space-y-5 text-slate-800 print:hidden">

      {/* Switch Portal Banner for staff */}
      {isAdminOrStaff && (
        <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <span className="font-semibold text-slate-900">
            {isAdminPath ? t("navAdmin") : t("applicantPortal")}
          </span>
          <Link
            href={isAdminPath ? "/dashboard" : "/admin"}
            className="text-[11px] font-semibold text-white bg-indigo-600 px-2.5 py-1 rounded hover:bg-indigo-700 transition-colors"
          >
            {isAdminPath ? t("switchToUser") : t("switchToAdmin")}
          </Link>
        </div>
      )}

      {/* Navigation Group */}
      <div className="space-y-1 text-xs">
        <p className="px-3 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {isAdminPath ? t("adminMenuHeader") : t("userMenuHeader")}
        </p>
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex items-center justify-between px-3 py-2 rounded font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Official Data Integrity Info Box */}
      <div className="pt-4 border-t border-slate-200">
        <div className="p-3 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t("securityStatusTitle")}</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-snug">
            {t("securityStatusDesc")}
          </p>
        </div>
      </div>
    </aside>
  );
};
