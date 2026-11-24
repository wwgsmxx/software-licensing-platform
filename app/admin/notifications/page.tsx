"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export default function AdminBroadcastNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast("error", "Validation Error", "Please provide a title and message.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, targetGroup }),
      });

      if (!res.ok) throw new Error("Broadcast failed");

      toast("success", "Broadcast Dispatched!", "Notification dispatched to selected user group.");
      setTitle("");
      setMessage("");
    } catch {
      toast("error", "Error", "Failed to dispatch notification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{t("adminNotifTitle")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("adminNotifSubtitle")}
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <Input
            label={t("adminNotifTitleInput")}
            placeholder="e.g. Platform System Maintenance Scheduled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label={t("adminNotifMsgInput")}
            placeholder="Write the detailed broadcast message here..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {t("adminNotifBtnLabel")}
          </Button>
        </form>
      </div>
    </div>
  );
}
