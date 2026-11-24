"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  Key,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";
import { Logo } from "@/components/shared/Logo";
import {
  checkNCALayerAvailability,
  getNCALayerKeyInfo,
  signDataWithNCALayer,
  NCALayerCertificateInfo,
} from "@/lib/ncalayer";

type LoginTab = "PASSWORD" | "ECP";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<LoginTab>("PASSWORD");

  // Password Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ECP (NCALayer) State
  const [ncaStatus, setNcaStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);
  const [isSigningEcp, setIsSigningEcp] = useState(false);
  const [ecpCert, setEcpCert] = useState<NCALayerCertificateInfo | null>(null);

  const checkNCALayer = async () => {
    setNcaStatus("CHECKING");
    setNcaError(null);
    try {
      const res = await checkNCALayerAvailability(2500);
      if (res.isAvailable) {
        setNcaStatus("AVAILABLE");
      } else {
        setNcaStatus("UNAVAILABLE");
        setNcaError(res.error || t("ncaNotRunningPrompt"));
      }
    } catch (e: unknown) {
      setNcaStatus("UNAVAILABLE");
      setNcaError(e instanceof Error ? e.message : t("ncaError"));
    }
  };

  const redirectAfterAuth = (roleCode: string) => {
    if (roleCode === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  // 1. Password Login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast("error", t("validationError"), t("pleaseEnterEmailAndPassword"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("loginFailed"));

      toast("success", t("authorized"), `${t("welcome")}, ${data.user.name}`);
      redirectAfterAuth(data.user.roleCode);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("invalidCredentials");
      toast("error", t("loginError"), message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. State EDS Login via NCALayer
  const handleEcpLogin = async () => {
    setIsSigningEcp(true);
    try {
      // 1. Check challenge from server
      const chRes = await fetch("/api/auth/challenge");
      const { challenge } = await chRes.json();

      // 2. Prompt user in NCALayer for certificate
      const cert = await getNCALayerKeyInfo("PKCS12");
      setEcpCert(cert);

      // 3. Request CMS signature of nonce challenge
      const challengeBase64 = Buffer.from(challenge).toString("base64");
      const signRes = await signDataWithNCALayer(challengeBase64, "PKCS12", "", false, cert);

      // 4. Send to server verification
      const res = await fetch("/api/auth/ecp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate: cert,
          signature: signRes.signature,
          challenge,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.notBound || res.status === 404) {
          throw new Error(
            data.error ||
              "Данная ЭЦП ещё не привязана к аккаунту. Войдите по логину и паролю и привяжите ЭЦП в разделе «Управление ЭЦП»."
          );
        }
        throw new Error(data.error || t("ecpAuthFailed"));
      }

      toast("success", t("authorized"), `${t("welcome")}, ${data.user.name}!`);
      redirectAfterAuth(data.user.roleCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("ecpAuthError");
      toast("error", t("ecpAuthTitle"), msg);
    } finally {
      setIsSigningEcp(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 text-slate-800 bg-slate-50/50">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <Logo size="lg" href="/" showTagline={false} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {t("loginTitle")}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t("loginSubtitle")}
          </p>
        </div>

        {/* Auth Method Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("PASSWORD")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "PASSWORD"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t("loginByPassword")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("ECP");
              if (ncaStatus === "IDLE") checkNCALayer();
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ECP"
                ? "bg-white text-indigo-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t("loginByEcp")}</span>
          </button>
        </div>

        {/* ── TAB 1: PASSWORD LOGIN ── */}
        {activeTab === "PASSWORD" && (
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <Input
                label={`${t("workEmail")} *`}
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label={`${t("password")} *`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                {t("signIn")}
              </Button>
            </form>
          </div>
        )}

        {/* ── TAB 2: STATE EDS (NCALAYER) LOGIN ── */}
        {activeTab === "ECP" && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5 text-xs">
            {/* Status card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{t("ncalayerStatus")}:</span>
                {ncaStatus === "CHECKING" && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t("checking")}
                  </span>
                )}
                {ncaStatus === "AVAILABLE" && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <Wifi className="w-3.5 h-3.5" /> {t("ncaConnected")}
                  </span>
                )}
                {ncaStatus === "UNAVAILABLE" && (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                    <WifiOff className="w-3.5 h-3.5" /> {t("ncaDisconnected")}
                  </span>
                )}
              </div>

              {ncaStatus === "UNAVAILABLE" && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] space-y-2">
                  <p className="flex items-start gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{t("ncaNotRunningDetail")}</span>
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={checkNCALayer}
                      className="bg-white border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] h-7"
                      leftIcon={<RefreshCw className="w-3 h-3" />}
                    >
                      {t("checkAgain")}
                    </Button>
                    <a
                      href="https://pki.gov.kz/ncalayer/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      {t("downloadNcaLayer")} →
                    </a>
                  </div>
                </div>
              )}

              {ncaStatus === "AVAILABLE" && (
                <p className="text-[11px] text-slate-500">
                  {t("ncaReadyInstruction")}
                </p>
              )}
            </div>

            {/* Selected Cert Banner */}
            {ecpCert && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{ecpCert.ownerName}</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  {ecpCert.iin ? `ИИН: ${ecpCert.iin}` : ""}
                  {ecpCert.bin ? ` | БИН: ${ecpCert.bin}` : ""}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {ecpCert.issuer}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isSigningEcp}
              disabled={ncaStatus === "UNAVAILABLE"}
              onClick={handleEcpLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              leftIcon={<Key className="w-4 h-4" />}
            >
              {t("selectKeyAndLoginNca")}
            </Button>

            <div className="pt-2 text-center text-slate-500 text-[11px]">
              {t("noEcpYet")}{" "}
              <Link href="/get-ecp" className="text-indigo-600 font-bold hover:underline">
                {t("getEcpGuidanceLink")} →
              </Link>
            </div>
          </div>
        )}

        {/* Bottom register link */}
        <div className="text-center text-xs text-slate-600 pt-2">
          {t("noAccountYet")}{" "}
          <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700">
            {t("register")}
          </Link>
        </div>
      </div>
    </div>
  );
}
