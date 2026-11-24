"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Lock, FileText, Send, Eye, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function HowItWorksPage() {
  const { locale } = useLanguage();

  const CONTENT = {
    en: {
      badge: "Official Service Guide",
      title: "How to Obtain and Verify a Software License",
      subtitle: "Step-by-step guidance on submitting an application, applying digital signatures, and obtaining an authentic license certificate.",
      cta: "Apply for License Now",
      steps: [
        { num: "1", title: "Portal Registration", desc: "Create your personal account as an individual developer or company representative.", icon: Lock },
        { num: "2", title: "Software Details", desc: "Specify product information: software name, version, category, and technical platform.", icon: FileText },
        { num: "3", title: "Document Upload & Integrity Check", desc: "Attach supporting technical documentation. The system computes file checksums to prevent tampering.", icon: ShieldCheck },
        { num: "4", title: "Review Application Data", desc: "Inspect all submitted specifications and verify details before executing the digital signature.", icon: Eye },
        { num: "5", title: "Digital Signature Confirmation", desc: "Confirm the application with a cryptographic digital signature ensuring non-repudiation and data integrity.", icon: Lock },
        { num: "6", title: "Submission for Review", desc: "Your application is forwarded to authorized reviewers for compliance and document audit.", icon: Send },
        { num: "7", title: "Compliance Review & Decision", desc: "Reviewers inspect submitted files and either approve, reject with feedback, or request additional data.", icon: CheckCircle2 },
        { num: "8", title: "License Issuance & Verification", desc: "Upon approval, an official license certificate with an online QR verification code is issued.", icon: Award },
      ],
    },
    kk: {
      badge: "Ресми қызмет нұсқаулығы",
      title: "Бағдарламалық жасақтама лицензиясын алу және тексеру тәртібі",
      subtitle: "Өтінім беру, сандық қолтаңба қою және түпнұсқа лицензиялық сертификат алудың қадамдық нұсқаулығы.",
      cta: "Лицензияға өтінім беру",
      steps: [
        { num: "1", title: "Порталға тіркелу", desc: "Жеке әзірлеуші немесе ұйым өкілі ретінде жеке кабинетке тіркеліңіз.", icon: Lock },
        { num: "2", title: "Бағдарлама туралы мәліметтер", desc: "Өнім туралы ақпаратты енгізіңіз: атауы, нұсқасы, санаты және техникалық платформасы.", icon: FileText },
        { num: "3", title: "Құжаттарды жүктеу және тұтастықты тексеру", desc: "Техникалық құжаттаманы тіркеңіз. Жүйе файлдардың өзгертілмегенін растау үшін бақылау сомасын есептейді.", icon: ShieldCheck },
        { num: "4", title: "Өтінім деректерін тексеру", desc: "Сандық қолтаңба қоймас бұрын барлық енгізілген мәліметтерді қайта қарап шығыңыз.", icon: Eye },
        { num: "5", title: "Сандық қолтаңбамен растау", desc: "Деректердің тұтастығы мен түпнұсқалығын қамтамасыз ету үшін өтінімге сандық қолтаңба қойыңыз.", icon: Lock },
        { num: "6", title: "Өтінімді қарауға жіберу", desc: "Қол қойылған өтінім уәкілетті рецензенттердің тексеру кезегіне автоматты түрде түседі.", icon: Send },
        { num: "7", title: "Құжаттарды қарау және шешім қабылдау", desc: "Рецензент құжаттарды тексереді, мақұлдайды, себебін көрсетіп қабылдамайды немесе қосымша мәлімет сұрайды.", icon: CheckCircle2 },
        { num: "8", title: "Лицензия беру және верификация", desc: "Өтінім мақұлданған соң QR-код арқылы тексерілетін ресми электрондық лицензия беріледі.", icon: Award },
      ],
    },
    ru: {
      badge: "Официальное руководство к услуге",
      title: "Как получить и проверить лицензию на ПО",
      subtitle: "Пошаговый порядок подачи заявления, заверения электронной подписью и получения официального лицензионного сертификата.",
      cta: "Подать заявление сейчас",
      steps: [
        { num: "1", title: "Регистрация на портале", desc: "Зарегистрируйте личный кабинет разработчика или представителя организации.", icon: Lock },
        { num: "2", title: "Сведения о программе", desc: "Укажите наименование продукта, версию, тип программного обеспечения и платформу.", icon: FileText },
        { num: "3", title: "Загрузка документов и проверка целостности", desc: "Приложите техническую документацию. Система рассчитывает контрольную сумму каждого файла для защиты от подделки.", icon: ShieldCheck },
        { num: "4", title: "Проверка сведений заявления", desc: "Ознакомьтесь со сводными данными заявления перед формированием электронной подписи.", icon: Eye },
        { num: "5", title: "Заверение электронной подписью", desc: "Подтвердите заявление электронной цифровой подписью, защищающей данные от последующих изменений.", icon: Lock },
        { num: "6", title: "Отправка на рассмотрение", desc: "Подписанное заявление передаётся на рассмотрение рецензентам и регистрируется в системе.", icon: Send },
        { num: "7", title: "Проверка заявления и решение", desc: "Специалисты проверяют документы и принимают решение: одобрить, отклонить или запросить доработку.", icon: CheckCircle2 },
        { num: "8", title: "Выпуск лицензии и проверка подлинности", desc: "После одобрения формируется официальный электронный сертификат лицензии с QR-кодом для онлайн-проверки.", icon: Award },
      ],
    },
  };

  const c = CONTENT[locale];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-800">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold">
          {c.badge}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{c.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">{c.subtitle}</p>
      </div>

      <div className="space-y-4">
        {c.steps.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded border border-slate-200 bg-white shadow-sm"
            >
              <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                {s.num}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/dashboard/applications/new">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {c.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
