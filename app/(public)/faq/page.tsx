"use client";

import React from "react";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function FAQPage() {
  const { locale } = useLanguage();

  const CONTENT = {
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Official answers to common questions about filing software license applications and digital signature verification.",
      faqs: [
        {
          q: "What is a digital signature and why is it needed?",
          a: "A digital signature is a cryptographic mechanism confirming the authenticity of an applicant and ensuring data integrity. It proves mathematically that submitted software metadata and documents have not been tampered with since signing.",
        },
        {
          q: "What happens if a document is changed after signing?",
          a: "If any attached file or form field is altered after digital signing, the file's checksum changes. The system detects the discrepancy, invalidates the signature, and requires the applicant to review and re-sign the updated application.",
        },
        {
          q: "How can anyone verify an issued license?",
          a: "Anyone can verify an issued document online on the portal's verification page (/verify-license) by entering the license number or scanning the QR code on the certificate.",
        },
        {
          q: "How long does application review usually take?",
          a: "Under standard operating regulations, compliance reviewers examine the submitted documentation within 3 to 5 business days.",
        },
        {
          q: "Can I make changes to an application after submitting it?",
          a: "Once submitted to the review queue, application data is locked to maintain audit integrity. If additional information or corrections are requested by a reviewer, the application status changes to 'Additional Information Required', enabling edits.",
        },
      ],
    },
    kk: {
      title: "Жиі қойылатын сұрақтар",
      subtitle: "Бағдарламалық жасақтаманы лицензиялауға өтінім беру және сандық қолтаңбаны тексеру бойынша ресми түсініктемелер.",
      faqs: [
        {
          q: "Сандық қолтаңба деген не және ол не үшін қажет?",
          a: "Сандық қолтаңба — өтініш берушінің жеке басын және деректердің тұтастығын растайтын криптографиялық механизм. Ол өтінім мен құжаттардың қол қойылғаннан кейін өзгертілмегенін заңды түрде дәлелдейді.",
        },
        {
          q: "Қол қойылғаннан кейін құжат өзгерсе не болады?",
          a: "Егер қандай да бір құжат немесе деректер өзгерсе, файлдың бақылау сомасы өзгереді. Жүйе сәйкессіздікті анықтап, қолтаңбаны жарамсыз деп таниды және қайта қол қоюды талап етеді.",
        },
        {
          q: "Берілген лицензияның заңдылығын қалай тексеруге болады?",
          a: "Кез келген тұлға лицензия нөмірін енгізу немесе сертификаттағы QR-кодты сканерлеу арқылы порталдың тексеру парақшасында (/verify-license) онлайн тексере алады.",
        },
        {
          q: "Өтінімді қарау қанша уақытты алады?",
          a: "Регламент бойынша уәкілетті мамандар ұсынылған құжаттаманы 3-тен 5 жұмыс күніне дейін қарайды.",
        },
        {
          q: "Өтінімді жібергеннен кейін өзгеріс енгізуге бола ма?",
          a: "Қарауға жіберілгеннен кейін деректер бұрмалаудан қорғау үшін бекітіледі. Егер маман қосымша мәлімет сұраса, өтінімге толықтыру енгізу мүмкіндігі ашылады.",
        },
      ],
    },
    ru: {
      title: "Часто задаваемые вопросы",
      subtitle: "Официальные ответы на ключевые вопросы о подаче заявлений на лицензирование ПО и проверке электронной подписи.",
      faqs: [
        {
          q: "Что такое электронная цифровая подпись и для чего она нужна?",
          a: "Электронная подпись — это криптографический инструмент подтверждения авторства и целостности заявления. Она гарантирует, что приложенные документы и сведения о программе не изменялись после момента подписания.",
        },
        {
          q: "Что произойдёт, если изменить документ после подписания?",
          a: "Если файл будет отредактирован или заменён, его контрольная сумма изменится. Система немедленно зафиксирует нарушение целостности, признает подпись недействительной и потребует повторного подписания.",
        },
        {
          q: "Как проверить подлинность выданной лицензии?",
          a: "Любой гражданин или организация может проверить актуальность и статус документа в публичном разделе «Проверка лицензии» (/verify-license) по номеру сертификата или через QR-код.",
        },
        {
          q: "Сколько времени занимает рассмотрение заявления?",
          a: "Согласно регламенту, рассмотрение заявления экспертами-рецензентами занимает от 3 до 5 рабочих дней с момента подачи.",
        },
        {
          q: "Можно ли внести исправления в уже отправленное заявление?",
          a: "После отправки данные заявления фиксируются для обеспечения неизменяемости аудита. Если эксперт запросит уточнения, статус заявления изменится на «Требуются дополнительные сведения», и форма откроется для доработки.",
        },
      ],
    },
  };

  const c = CONTENT[locale];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <HelpCircle className="w-7 h-7 text-indigo-600" /> {c.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">{c.subtitle}</p>
      </div>

      <div className="space-y-3">
        {c.faqs.map((faq, idx) => (
          <div key={idx} className="p-5 rounded border border-slate-200 bg-white space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
