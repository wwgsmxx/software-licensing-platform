"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Key,
  Lock,
  AlertCircle,
  Building2,
  UserCheck,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload, UploadedDoc } from "@/components/ui/FileUpload";
import { DigitalSignatureCard } from "@/components/ui/DigitalSignatureCard";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";
import {
  checkNCALayerAvailability,
  getNCALayerKeyInfo,
  signDataWithNCALayer,
  NCALayerCertificateInfo,
} from "@/lib/ncalayer";

export default function NewApplicationWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1 State: Applicant Entity & Software Info ──
  const [applicantType, setApplicantType] = useState<"INDIVIDUAL" | "LEGAL_ENTITY">("INDIVIDUAL");

  // Individual fields
  const [applicantName, setApplicantName] = useState("");
  const [applicantIin, setApplicantIin] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");

  // Legal entity fields
  const [orgName, setOrgName] = useState("");
  const [orgBin, setOrgBin] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeRole, setRepresentativeRole] = useState("FIRST_LEADER");
  const [representativeBasis, setRepresentativeBasis] = useState("Устав организации");

  // Software details
  const [softwareName, setSoftwareName] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("1.0.0");
  const [developer, setDeveloper] = useState("");
  const [softwareDescription, setSoftwareDescription] = useState("");
  const [softwareType, setSoftwareType] = useState("Enterprise");
  const [platform, setPlatform] = useState("Cross-platform");

  // ── Step 2 State: License Terms ──
  const [licenseType, setLicenseType] = useState("Commercial");
  const [licenseDuration, setLicenseDuration] = useState("1 Year");
  const [numUsers, setNumUsers] = useState(10);
  const [licenseDescription, setLicenseDescription] = useState("");

  // ── Step 3 State: Documents ──
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDoc[]>([]);

  // ── Step 4 State: Signing method ──
  const [signingMethod, setSigningMethod] = useState<"NCALAYER" | "SIMULATED">("NCALAYER");
  const [consentSigned, setConsentSigned] = useState(false);

  // NCALayer state
  const [ncaStatus, setNcaStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);
  const [ncaCert, setNcaCert] = useState<NCALayerCertificateInfo | null>(null);
  const [isCheckingNca, setIsCheckingNca] = useState(false);

  // ── Step 5 & 6 State: Result ──
  const [signatureResult, setSignatureResult] = useState<any | null>(null);
  const [generatedAppId, setGeneratedAppId] = useState<string | null>(null);

  // Helper: check NCALayer
  const probeNCALayer = async () => {
    setIsCheckingNca(true);
    setNcaStatus("CHECKING");
    setNcaError(null);
    try {
      const res = await checkNCALayerAvailability(2500);
      if (res.isAvailable) {
        setNcaStatus("AVAILABLE");
      } else {
        setNcaStatus("UNAVAILABLE");
        setNcaError(res.error || "NCALayer не запущен на порту 13579");
      }
    } catch (e: unknown) {
      setNcaStatus("UNAVAILABLE");
      setNcaError(e instanceof Error ? e.message : "Ошибка подключения к NCALayer");
    } finally {
      setIsCheckingNca(false);
    }
  };

  // Helper: choose certificate in NCALayer & auto-populate fields
  const handleSelectNcaCert = async () => {
    try {
      const cert = await getNCALayerKeyInfo("PKCS12");
      setNcaCert(cert);

      // Auto-populate verified fields
      if (applicantType === "INDIVIDUAL") {
        setApplicantName(cert.ownerName);
        if (cert.iin) setApplicantIin(cert.iin);
      } else {
        setRepresentativeName(cert.ownerName);
        if (cert.organizationName) setOrgName(cert.organizationName);
        if (cert.bin) setOrgBin(cert.bin);
      }

      toast("success", "Сертификат прочитан", `Владелец: ${cert.ownerName} (${cert.iin || cert.bin || "OK"})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка чтения ключа";
      toast("error", "NCALayer", msg);
    }
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (applicantType === "INDIVIDUAL") {
        if (!applicantName.trim()) {
          toast("error", "Заполните данные", "Укажите ФИО заявителя (гражданина).");
          return;
        }
      } else {
        if (!orgName.trim() || !orgBin.trim() || !representativeName.trim()) {
          toast("error", "Заполните данные организации", "Укажите наименование компании, БИН и ФИО представителя.");
          return;
        }
      }
      if (!softwareName.trim() || !developer.trim() || !softwareDescription.trim()) {
        toast("error", "Заполните ПО", "Укажите наименование программы, разработчика и описание.");
        return;
      }
    } else if (currentStep === 2) {
      if (!licenseType || !licenseDuration) {
        toast("error", "Параметры", "Укажите тип и срок действия лицензии.");
        return;
      }
    } else if (currentStep === 3) {
      if (uploadedDocuments.length === 0) {
        toast("error", "Приложите документы", "Загрузите хотя бы один файл технической документации или спецификации ПО.");
        return;
      }
    }

    // Reset signature if moving forward after edits
    setSignatureResult(null);
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    // If user goes back to edit, invalidate current signature
    setSignatureResult(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // ── Execute Digital Signature in Step 4 ──
  const executeDigitalSignature = async () => {
    if (!consentSigned) {
      toast("error", "Требуется согласие", "Подтвердите согласие на подписание заявления электронной цифровой подписью.");
      return;
    }

    setIsSubmitting(true);
    try {
      const basePayload = {
        softwareName,
        softwareVersion,
        developer,
        licenseType,
        licenseDuration,
        numUsers: Number(numUsers),
        documents: uploadedDocuments.map((d) => ({
          filename: d.originalName,
          checksumSha256: d.checksumSha256,
        })),
        applicantType,
        iin: applicantIin || undefined,
        bin: orgBin || undefined,
        orgName: orgName || undefined,
        representativeName: applicantType === "LEGAL_ENTITY" ? representativeName : applicantName,
      };

      let signaturePayloadToSend: any = {
        ...basePayload,
        signatureType: signingMethod,
      };

      // 1. NCALayer Signing
      if (signingMethod === "NCALAYER") {
        if (!ncaCert) {
          throw new Error("Сначала выберите сертификат через NCALayer");
        }
        // Build canonical payload representation to sign
        const jsonToSign = JSON.stringify(basePayload);
        const dataBase64 = Buffer.from(jsonToSign).toString("base64");

        const cmsResult = await signDataWithNCALayer(dataBase64, "PKCS12", "", false, ncaCert);

        signaturePayloadToSend.clientSignatureHex = cmsResult.signature;
        signaturePayloadToSend.certificate = ncaCert;
      }

      // 2. Simulated Demo Signing (handled server-side with test flag)
      const res = await fetch("/api/applications/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signaturePayloadToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка формирования подписи");

      setSignatureResult(data.signature);
      toast("success", "Заявление подписано", "Цифровая подпись успешно проверена и привязана.");
      setCurrentStep(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось подписать заявление";
      toast("error", "Ошибка подписи", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Final Application Submission in Step 5 ──
  const submitFinalApplication = async () => {
    if (!signatureResult) return;

    setIsSubmitting(true);
    try {
      const payload = {
        softwareName,
        softwareVersion,
        developer,
        softwareDescription,
        softwareType,
        platform,
        licenseType,
        licenseDuration,
        numUsers: Number(numUsers),
        licenseDescription,
        applicantType,
        orgName: applicantType === "LEGAL_ENTITY" ? orgName : null,
        orgBin: applicantType === "LEGAL_ENTITY" ? orgBin : null,
        orgAddress: applicantType === "LEGAL_ENTITY" ? orgAddress : null,
        representativeName: applicantType === "LEGAL_ENTITY" ? representativeName : applicantName,
        representativeRole: applicantType === "LEGAL_ENTITY" ? representativeRole : null,
        representativeBasis: applicantType === "LEGAL_ENTITY" ? representativeBasis : null,
        documents: uploadedDocuments,
        digitalSignature: signatureResult,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось отправить заявление");

      setGeneratedAppId(data.application.id);
      toast("success", "Заявление зарегистрировано", `Заявление № ${data.application.id} передано на экспертизу.`);
      setCurrentStep(6);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка отправки заявления";
      toast("error", "Ошибка отправки", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS_CONFIG = [
    { num: 1, title: "Заявитель и ПО", desc: "Субъект и программа" },
    { num: 2, title: "Условия", desc: "Тип и срок лицензии" },
    { num: 3, title: "Документы", desc: "Техдокументация" },
    { num: 4, title: "Проверка и ЭЦП", desc: "Подписание заявления" },
    { num: 5, title: "Результат подписи", desc: "Верификация" },
    { num: 6, title: "Итог", desc: "Номер заявления" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-slate-800">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Подача заявления на получение лицензии ПО
        </h1>
        <p className="text-xs text-slate-600">
          Пошаговый регламент с выбором типа заявителя (физлицо / юрлицо) и подписанием юридически значимой ЭЦП
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {STEPS_CONFIG.map((s) => {
          const isCurrent = currentStep === s.num;
          const isPast = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`p-2.5 rounded-lg transition-colors text-left flex flex-col justify-between ${
                isCurrent
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : isPast
                  ? "bg-white text-emerald-800 border border-slate-200"
                  : "text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent ? "bg-white text-indigo-600" : isPast ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {isPast ? "✓" : s.num}
                </span>
                <span className="font-semibold truncate">{s.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: ЗАЯВИТЕЛЬ И СВЕДЕНИЯ О ПО ── */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          {/* Entity Type Toggle */}
          <div className="space-y-3 border-b border-slate-100 pb-5">
            <label className="text-xs font-bold text-slate-700 block">
              От чьего имени подаётся заявка на лицензирование:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setApplicantType("INDIVIDUAL")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  applicantType === "INDIVIDUAL"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Физическое лицо</p>
                  <p className="text-[11px] text-slate-500">Гражданин / Индивидуальный разработчик</p>
                </div>
              </label>

              <label
                onClick={() => setApplicantType("LEGAL_ENTITY")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  applicantType === "LEGAL_ENTITY"
                    ? "border-teal-600 bg-teal-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Юридическое лицо</p>
                  <p className="text-[11px] text-slate-500">Организация (ТОО, АО, Предприятие)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Applicant Fields */}
          {applicantType === "INDIVIDUAL" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <Input
                  label="ФИО заявителя *"
                  placeholder="Фамилия Имя Отчество"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </div>
              <Input
                label="ИИН гражданина"
                placeholder="12 цифр"
                maxLength={12}
                value={applicantIin}
                onChange={(e) => setApplicantIin(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Полное наименование организации *"
                  placeholder="ТОО «Инновационные Системы»"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
                <Input
                  label="БИН организации *"
                  placeholder="12 цифр"
                  maxLength={12}
                  value={orgBin}
                  onChange={(e) => setOrgBin(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Юридический адрес организации"
                placeholder="г. Астана, ул. Достык, д. 18"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="ФИО представителя *"
                  placeholder="Фамилия Имя Отчество"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  required
                />
                <Select
                  label="Должность представителя *"
                  value={representativeRole}
                  onChange={(e) => setRepresentativeRole(e.target.value)}
                  options={[
                    { value: "FIRST_LEADER", label: "Первый руководитель" },
                    { value: "REPRESENTATIVE", label: "Представитель по доверенности" },
                  ]}
                />
                <Input
                  label="Основание полномочий *"
                  placeholder="Устав или Доверенность №..."
                  value={representativeBasis}
                  onChange={(e) => setRepresentativeBasis(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Software Information */}
          <div className="border-t border-slate-100 pt-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Сведения о программном продукте</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Наименование программы *"
                placeholder="например, DocuVault Enterprise"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                required
              />
              <Input
                label="Версия программы *"
                placeholder="1.0.0"
                value={softwareVersion}
                onChange={(e) => setSoftwareVersion(e.target.value)}
                required
              />
            </div>

            <Input
              label="Разработчик ПО *"
              placeholder="ТОО или ФИО разработчика"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Тип программного обеспечения"
                value={softwareType}
                onChange={(e) => setSoftwareType(e.target.value)}
                options={[
                  { value: "Enterprise", label: "Корпоративное ПО (Enterprise)" },
                  { value: "Desktop", label: "Настольное приложение (Desktop)" },
                  { value: "Web", label: "Веб-сервис / Облачная платформа (SaaS)" },
                  { value: "Mobile", label: "Мобильное приложение" },
                  { value: "API", label: "API / Системный сервис" },
                ]}
              />
              <Select
                label="Целевая платформа"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={[
                  { value: "Cross-platform", label: "Кроссплатформенное (Windows / Linux / macOS)" },
                  { value: "Windows", label: "ОС Windows" },
                  { value: "Linux", label: "ОС Linux / Cloud" },
                  { value: "Cloud", label: "Облачная инфраструктура" },
                ]}
              />
            </div>

            <Textarea
              label="Описание архитектуры и назначения программы *"
              placeholder="Опишите назначение, модули и функционал..."
              rows={3}
              value={softwareDescription}
              onChange={(e) => setSoftwareDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Продолжить к условиям
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: УСЛОВИЯ ЛИЦЕНЗИИ ── */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Шаг 2. Параметры лицензии</h2>
            <p className="text-xs text-slate-500">Укажите категорию, срок действия и количество лицензируемых мест</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Select
              label="Категория лицензии"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              options={[
                { value: "Commercial", label: "Коммерческая (Commercial)" },
                { value: "Enterprise", label: "Корпоративная (Enterprise)" },
                { value: "Educational", label: "Образовательная (Educational)" },
                { value: "Personal", label: "Персональная (Personal)" },
              ]}
            />
            <Select
              label="Срок действия"
              value={licenseDuration}
              onChange={(e) => setLicenseDuration(e.target.value)}
              options={[
                { value: "1 Year", label: "1 год" },
                { value: "2 Years", label: "2 года" },
                { value: "5 Years", label: "5 лет" },
                { value: "Perpetual", label: "Бессрочная (Perpetual)" },
              ]}
            />
            <Input
              label="Количество рабочих мест (Seats)"
              type="number"
              min={1}
              max={10000}
              value={numUsers}
              onChange={(e) => setNumUsers(Number(e.target.value))}
            />
          </div>

          <Textarea
            label="Дополнительные условия или ограничения"
            placeholder="Укажите условия распространения, сетевые ограничения (при наличии)..."
            rows={3}
            value={licenseDescription}
            onChange={(e) => setLicenseDescription(e.target.value)}
          />

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Назад
            </Button>
            <Button onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Продолжить к документам
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: ДОКУМЕНТЫ ── */}
      {currentStep === 3 && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Шаг 3. Документация и техническое описание</h2>
            <p className="text-xs text-slate-500">
              Хеш-сумма (SHA-256) каждого загруженного файла автоматически связывается с цифровой подписью заявления
            </p>
          </div>

          <FileUpload
            onFileUpload={(doc) => setUploadedDocuments((prev) => [...prev, doc])}
            onFileRemove={(checksum) => setUploadedDocuments((prev) => prev.filter((d) => d.checksumSha256 !== checksum))}
            uploadedFiles={uploadedDocuments}
          />

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Назад
            </Button>
            <Button onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Продолжить к проверке и ЭЦП
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: ПРОВЕРКА ДАННЫХ И ПОДПИСАНИЕ ЭЦП ── */}
      {currentStep === 4 && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Шаг 4. Проверка сведений и подписание заявления</h2>
            <p className="text-xs text-slate-500">
              Внимательно проверьте параметры и выберите официальный механизм формирования цифровой подписи
            </p>
          </div>

          {/* Exact data payload summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Заявитель ({applicantType === "LEGAL_ENTITY" ? "Юридическое лицо" : "Физическое лицо"})
              </span>
              {applicantType === "LEGAL_ENTITY" ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{orgName}</p>
                  <p className="text-slate-600">БИН: <strong>{orgBin}</strong></p>
                  <p className="text-slate-600">Представитель: <strong>{representativeName}</strong> ({representativeRole})</p>
                  <p className="text-slate-500">Основание: {representativeBasis}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{applicantName}</p>
                  <p className="text-slate-600">ИИН: <strong>{applicantIin || "—"}</strong></p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Лицензируемое ПО и условия
              </span>
              <p className="font-bold text-slate-900">{softwareName} v{softwareVersion}</p>
              <p className="text-slate-600">Разработчик: <strong>{developer}</strong></p>
              <p className="text-slate-600">Лицензия: <strong>{licenseType}</strong> ({licenseDuration}) • {numUsers} мест</p>
              <p className="text-slate-500">Прикреплено файлов: {uploadedDocuments.length}</p>
            </div>
          </div>

          {/* Choice of Digital Signature Method */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-900 block">
              Выберите способ подписания заявления:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: NCALayer */}
              <label
                onClick={() => {
                  setSigningMethod("NCALAYER");
                  if (ncaStatus === "IDLE") probeNCALayer();
                }}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  signingMethod === "NCALAYER"
                    ? "border-indigo-600 bg-indigo-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="signingMethod"
                    checked={signingMethod === "NCALAYER"}
                    onChange={() => setSigningMethod("NCALAYER")}
                    className="text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Государственная ЭЦП</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Через сервис NCALayer (НУЦ РК)</p>
                </div>
              </label>

              {/* Option 2: Demo / Test */}
              <label
                onClick={() => setSigningMethod("SIMULATED")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  signingMethod === "SIMULATED"
                    ? "border-amber-500 bg-amber-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <input
                    type="radio"
                    name="signingMethod"
                    checked={signingMethod === "SIMULATED"}
                    onChange={() => setSigningMethod("SIMULATED")}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Тестовая подпись</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Демо-подпись для проверки регламента</p>
                </div>
              </label>
            </div>
          </div>

          {/* Sub-view for NCALayer */}
          {signingMethod === "NCALAYER" && (
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ncaStatus === "AVAILABLE" ? (
                    <Wifi className="w-4 h-4 text-emerald-600" />
                  ) : ncaStatus === "UNAVAILABLE" ? (
                    <WifiOff className="w-4 h-4 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  )}
                  <span className="font-bold text-slate-900">
                    Статус NCALayer: {ncaStatus === "AVAILABLE" ? "Доступен" : ncaStatus === "UNAVAILABLE" ? "Не запущен" : "Проверка..."}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={probeNCALayer} disabled={isCheckingNca}>
                  {isCheckingNca ? "Проверка..." : "Обновить"}
                </Button>
              </div>

              {ncaStatus === "UNAVAILABLE" && (
                <p className="text-rose-700 text-[11px]">
                  Запустите NCALayer на компьютере или выберите другой способ подписания.
                </p>
              )}

              {ncaCert ? (
                <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-1">
                  <p className="font-bold text-indigo-900">{ncaCert.ownerName}</p>
                  <p className="text-[11px] text-slate-600">ИИН: {ncaCert.iin || "—"} • {ncaCert.algorithm}</p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={ncaStatus === "UNAVAILABLE"}
                  onClick={handleSelectNcaCert}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  leftIcon={<Key className="w-4 h-4" />}
                >
                  Выбрать сертификат через NCALayer
                </Button>
              )}
            </div>
          )}

          {/* Sub-view for Demo */}
          {signingMethod === "SIMULATED" && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" /> Внимание: Тестовая демонстрационная подпись
              </p>
              <p className="text-[11px] leading-relaxed">
                Данная подпись генерируется встроенным эмулятором для целей тестирования сценария платформы и не является юридически значимой государственной ЭЦП.
              </p>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentSigned}
                onChange={(e) => setConsentSigned(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-slate-800 font-medium leading-relaxed">
                Я подтверждаю достоверность указанных сведений и выражаю согласие на подписание заявления электронной цифровой подписью.
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Назад
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              onClick={executeDigitalSignature}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              leftIcon={<Key className="w-4 h-4" />}
            >
              Сформировать и подписать ЭЦП
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: РЕЗУЛЬТАТ ПОДПИСИ И ОТПРАВКА ── */}
      {currentStep === 5 && signatureResult && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Шаг 5. Проверка сформированной подписи</h2>
            <p className="text-xs text-slate-500">
              Электронная цифровая подпись успешно сгенерирована и проверена сервером
            </p>
          </div>

          {/* Dynamic Signature Card */}
          <DigitalSignatureCard signature={signatureResult} />

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              Изменить данные
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onClick={submitFinalApplication}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Подать заявление на рассмотрение
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 6: ИТОГОВАЯ РЕГИСТРАЦИЯ ── */}
      {currentStep === 6 && (
        <div className="p-8 text-center rounded-2xl border border-emerald-200 bg-white space-y-6 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Заявление успешно зарегистрировано!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Заявлению присвоен официальный регистрационный номер:
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-base font-bold text-indigo-700">
              № {generatedAppId}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Заявление передано на экспертизу. Вы получите уведомление при выпуске лицензии и формировании официального сертификата.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link href={`/dashboard/applications/${generatedAppId}`}>
              <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Просмотреть заявку
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button variant="outline" size="md">
                Все заявки
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
