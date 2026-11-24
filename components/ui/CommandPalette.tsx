"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Award, ShieldCheck, User, Settings, ArrowRight, Command } from "lucide-react";

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const NAV_ITEMS = [
    { title: "Create Application Wizard", url: "/dashboard/applications/new", icon: FileText, group: "Actions" },
    { title: "View Applications List", url: "/dashboard/applications", icon: FileText, group: "Navigation" },
    { title: "My Digital Licenses", url: "/dashboard/licenses", icon: Award, group: "Navigation" },
    { title: "Verify License Certificate", url: "/verify-license", icon: ShieldCheck, group: "Tools" },
    { title: "Manage Registered Software", url: "/dashboard/software", icon: Settings, group: "Navigation" },
    { title: "User Profile & Security", url: "/dashboard/profile", icon: User, group: "Settings" },
    { title: "Admin Operations Dashboard", url: "/admin", icon: Settings, group: "Admin" },
  ];

  const filtered = NAV_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-border bg-muted/30">
          <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search pages, applications, certificates... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted border border-border rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 divide-y divide-border/40">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.url)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.group}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
              );
            })
          ) : (
            <p className="p-4 text-center text-xs text-muted-foreground">No matching command or destination found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
