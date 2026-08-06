"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const faqs = [
  {
    q: "Is AcademyX suitable for a small coaching centre?",
    a: "Yes. The Starter plan is designed for a single coaching institute with up to 200 students, and you can upgrade as your academy grows. Setup takes under 10 minutes and no credit card is required to start.",
  },
  {
    q: "Can I migrate my existing students, batches and courses?",
    a: "Absolutely. You can add students and batches manually, and our support team helps you import data from spreadsheets or other management software during onboarding.",
  },
  {
    q: "Do you support both online and offline batches?",
    a: "Yes. AcademyX handles offline institutes, online-only academies and hybrid models. Mark attendance in person or let it happen automatically when students join a live class.",
  },
  {
    q: "How do fees and payments work?",
    a: "Create fee structures per course or batch and collect payments via Razorpay (UPI, cards, net banking). AcademyX generates receipts and invoices automatically and tracks pending fees for you.",
  },
  {
    q: "Will my students need a separate mobile app?",
    a: "No. Students get a mobile-friendly portal — course library, live classes, recorded lectures, exams and assignments — all from their browser. No app store downloads required.",
  },
  {
    q: "Can I customise the portal with my own branding?",
    a: "On Professional and Enterprise plans you can upload your institute logo, choose your brand colours and use your own domain, so students see your brand, not ours.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <MarketingHeader />
      <section className="border-b border-border-subtle">
        <div className="max-w-[768px] mx-auto px-4 md:px-6 py-20 md:py-24 text-center">
          <h1 className="font-bold text-4xl md:text-6xl tracking-tight text-text-heading">
            Frequently asked questions
          </h1>
          <p className="mt-6 text-lg text-text-muted">
            Everything you need to know before starting your free trial.
          </p>
        </div>
      </section>
      <section className="max-w-[768px] mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={cn(
                  "rounded-xl border bg-surface overflow-hidden transition-colors",
                  isOpen ? "border-primary/40" : "border-border-subtle"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-text-heading text-sm">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-text-muted shrink-0 transition-transform",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
