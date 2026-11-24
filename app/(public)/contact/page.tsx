"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export default function ContactPage() {
  const { locale } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const TEXTS = {
    en: {
      title: "Contact Official Support",
      subtitle: "Questions regarding software licensing applications, digital signatures, or technical issues.",
      directContacts: "Contact Information",
      emailSupport: "Email Inquiries",
      helpline: "Unified Call-Center",
      location: "Location",
      locationVal: "Astana, Kazakhstan",
      msgReceived: "Inquiry Received",
      msgDesc: "Your message has been registered. An authorized support officer will respond shortly.",
      sendAnother: "Send Another Inquiry",
      nameLabel: "Full Name *",
      emailLabel: "Email Address *",
      subjectLabel: "Subject",
      messageLabel: "Message *",
      submitBtn: "Send Inquiry",
    },
    kk: {
      title: "Қолдау қызметімен байланыс",
      subtitle: "Бағдарламалық жасақтаманы лицензиялау, сандық қолтаңба немесе техникалық мәселелер бойынша сұрақтар.",
      directContacts: "Байланыс ақпараты",
      emailSupport: "Электрондық пошта",
      helpline: "Бірыңғай байланыс орталығы",
      location: "Мекенжайы",
      locationVal: "Астана, Қазақстан",
      msgReceived: "Өтініш қабылданды",
      msgDesc: "Сіздің хабарламаңыз тіркелді. Қолдау маманы жақын арада жауап береді.",
      sendAnother: "Тағы бір өтініш жіберу",
      nameLabel: "Толық аты-жөні *",
      emailLabel: "Электрондық пошта *",
      subjectLabel: "Тақырыбы",
      messageLabel: "Хабарлама *",
      submitBtn: "Өтінішті жіберу",
    },
    ru: {
      title: "Служба поддержки и контакты",
      subtitle: "Вопросы по подаче заявлений на лицензирование программного обеспечения, электронной подписи или технической работе портала.",
      directContacts: "Контактная информация",
      emailSupport: "Электронная почта",
      helpline: "Единый контакт-центр",
      location: "Местоположение",
      locationVal: "г. Астана, Республика Казахстан",
      msgReceived: "Обращение зарегистрировано",
      msgDesc: "Ваше сообщение принято. Специалист службы поддержки свяжется с вами в установленные сроки.",
      sendAnother: "Отправить ещё одно обращение",
      nameLabel: "ФИО заявителя *",
      emailLabel: "Адрес электронной почты *",
      subjectLabel: "Тема обращения",
      messageLabel: "Текст обращения *",
      submitBtn: "Отправить обращение",
    },
  };

  const t = TEXTS[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast("error", "Ошибка", "Пожалуйста, заполните обязательные поля формы.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSubmitted(true);
      toast("success", "Отправлено", "Ваше обращение принято.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast("error", "Ошибка", "Не удалось отправить сообщение.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Sidebar */}
        <div className="space-y-4 p-5 rounded border border-slate-200 bg-white shadow-sm">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{t.directContacts}</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-indigo-600 rounded shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t.helpline}</span>
                <span className="font-bold text-slate-900">1414 (eGov)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-indigo-600 rounded shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t.emailSupport}</span>
                <span className="font-semibold text-slate-800">support@licensing.gov.kz</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-indigo-600 rounded shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t.location}</span>
                <span className="text-slate-700">{t.locationVal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-6 rounded border border-slate-200 bg-white shadow-sm">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full w-fit mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.msgReceived}</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">{t.msgDesc}</p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                {t.sendAnother}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t.nameLabel}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Иван Иванов"
                  required
                />
                <Input
                  label={t.emailLabel}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.kz"
                  required
                />
              </div>

              <Input
                label={t.subjectLabel}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Тема вопроса или номер заявления"
              />

              <Textarea
                label={t.messageLabel}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Опишите ваш вопрос..."
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
              >
                {t.submitBtn}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
