"use client";

import React from "react";
import { ShieldCheck, Lock, Award, FileCode, CheckCircle2, BookOpen, Users } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function AboutPage() {
  const { locale } = useLanguage();

  const CONTENT = {
    en: {
      badge: "Information System",
      title: "About the Licensing Portal",
      subtitle: "«Software Licensing Process with a Digital Signature» — Cryptographic Security and E-Government Demonstration Platform",
      card1Title: "Purpose of the System",
      card1Desc: "The platform provides a unified and transparent electronic service for software registration, license applications, and verification. It demonstrates how modern digital signatures eliminate paper bureaucracy and secure applicant data from tampering.",
      card2Title: "Digital Signature & Integrity Protection",
      card2Desc: "The system implements SHA-256 payload canonicalization and Ed25519 asymmetric cryptography. Every application payload and attached document hash is bound into a verifiable signature, mathematically proving data has not been modified since signing.",
      card3Title: "Role-Based Governance",
      card3Desc: "Distinct roles (Applicant User, Reviewer, License Manager, System Administrator) govern the life cycle from initial filing to license issuance. Every transition is audited in an immutable security log.",
      card4Title: "Public Verification",
      card4Desc: "Citizens, enterprises, and audits can independently verify any issued certificate using its unique number or QR code without exposing confidential applicant data.",
      disclaimerTitle: "Academic & Demonstration Status",
      disclaimerDesc: "This project is developed for educational and academic demonstration purposes within the 3rd-year Cryptography curriculum. Digital signatures and verification mechanisms are simulated locally on the server.",
    },
    kk: {
      badge: "Ақпараттық жүйе",
      title: "Лицензиялау порталы туралы",
      subtitle: "«Сандық қолтаңбасы бар бағдарламалық жасақтаманы лицензиялау процесі» — Криптографиялық қауіпсіздік және электрондық мемлекеттік қызметтер платформасы",
      card1Title: "Жүйенің негізгі мақсаты",
      card1Desc: "Платформа бағдарламалық жасақтаманы тіркеу, лицензия алуға өтінім беру және оның түпнұсқалығын тексеру үшін бірыңғай электрондық қызмет көрсетеді.",
      card2Title: "Сандық қолтаңба және деректер тұтастығы",
      card2Desc: "Жүйеде SHA-256 бақылау сомалары мен Ed25519 асимметриялық криптографиясы қолданылады. Құжаттар мен өтінім деректері қол қойылғаннан кейін өзгертуге қарсы толықтай қорғалған.",
      card3Title: "Рөлге негізделген басқару",
      card3Desc: "Жүйеде төрт рөл (Өтініш беруші, Рецензент, Лицензия менеджері, Әкімші) анықталған. Барлық әрекеттер жүйелік аудит журналында сақталады.",
      card4Title: "Ашық верификация",
      card4Desc: "Кез келген азамат немесе ұйым берілген лицензияның нөмірі немесе QR-коды арқылы оның заңды күшін тексере алады.",
      disclaimerTitle: "Оқу-академиялық мәртебесі",
      disclaimerDesc: "Бұл жоба 3-курс криптография пәні аясында оқу-демонстрациялық мақсатта жасалған. Сандық қолтаңбалар мен тексеру механизмдері оқу демонстрациясы үшін жергілікті түрде модельденген.",
    },
    ru: {
      badge: "Информационная система",
      title: "О портале лицензирования",
      subtitle: "«Процесс лицензирования программного обеспечения с цифровой подписью» — Демонстрационная государственная информационная система",
      card1Title: "Назначение информационной системы",
      card1Desc: "Портал предоставляет единый электронный сервис для подачи заявлений на лицензирование программных продуктов, проведения экспертной проверки и публичной верификации выданных лицензий.",
      card2Title: "Электронная подпись и защита целостности",
      card2Desc: "Система обеспечивает защиту целостности данных с помощью алгоритмов SHA-256 и асимметричной электронной подписи Ed25519. Любое несанкционированное изменение сведений или файлов делает подпись недействительной.",
      card3Title: "Ролевое разграничение доступа",
      card3Desc: "В системе предусмотрены роли: Заявитель (гражданин/организация), Рецензент (эксперт), Менеджер лицензий и Администратор. Каждый этап строго регламентирован и фиксируется в журнале аудита.",
      card4Title: "Открытая проверка подлинности",
      card4Desc: "Каждый выданный документ содержит уникальный идентификатор и QR-код, позволяющий мгновенно проверить актуальный статус лицензии онлайн без разглашения конфиденциальных данных.",
      disclaimerTitle: "Учебно-академический статус",
      disclaimerDesc: "Проект разработан в рамках учебного курса по криптографии для студентов 3-го курса. Механизмы цифровой подписи и проверки смоделированы на сервере в образовательных целях.",
    },
  };

  const c = CONTENT[locale];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold">
          {c.badge}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{c.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">{c.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="p-2 bg-slate-100 text-indigo-600 rounded w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">{c.card1Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{c.card1Desc}</p>
        </div>

        <div className="p-5 rounded border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="p-2 bg-slate-100 text-indigo-600 rounded w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">{c.card2Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{c.card2Desc}</p>
        </div>

        <div className="p-5 rounded border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="p-2 bg-slate-100 text-indigo-600 rounded w-fit">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">{c.card3Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{c.card3Desc}</p>
        </div>

        <div className="p-5 rounded border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="p-2 bg-slate-100 text-indigo-600 rounded w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">{c.card4Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{c.card4Desc}</p>
        </div>
      </div>

      <div className="p-5 rounded bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          {c.disclaimerTitle}
        </h4>
        <p className="text-slate-600 leading-relaxed">
          {c.disclaimerDesc}
        </p>
      </div>
    </div>
  );
}
