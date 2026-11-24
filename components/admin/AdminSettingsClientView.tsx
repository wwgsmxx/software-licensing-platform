"use client";

import React from "react";
import { ShieldCheck, Database } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/lib/LanguageContext";

export function AdminSettingsClientView() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{t("adminSettingsTitle")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("adminSettingsSubtitle")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t("signatureProvider")}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{t("adminSettingsSigProvider")}</p>
                <p className="text-muted-foreground text-[11px]">{t("adminSettingsSigProviderDesc")}</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <Input label={t("adminSettingsPubKey")} defaultValue="E5D4C3B2A1098765" readOnly />
            <Input label={t("adminSettingsUploadSize")} defaultValue="25 MB" readOnly />
            <Input label={t("adminSettingsSla")} defaultValue="72 Hours" readOnly />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" /> {t("adminSettingsDbTitle")}
          </h3>

          <div className="p-3.5 rounded-xl border border-border bg-card/60 text-xs space-y-1">
            <p className="font-semibold text-foreground">{t("adminSettingsDbOrmInfo")}</p>
            <p className="text-muted-foreground font-mono text-[11px]">{t("adminSettingsDbProvider")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
