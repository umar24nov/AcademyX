"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const testimonials = [
  {
    name: "Arif Hussain",
    role: "Director, Sunrise Academy — Hyderabad",
    quote:
      "We run 12 batches with 800+ students on AcademyX. Attendance, fees and exams that took my staff a full week now close before lunchtime.",
  },
  {
    name: "Mohammed Imran",
    role: "Founder, Al-Madina Coaching Centre — Lucknow",
    quote:
      "Live classes and recorded lectures in one place changed everything for our evening batch students. Parents finally see exactly what their children are learning.",
  },
  {
    name: "Rohan Sharma",
    role: "Owner, Sharma Classes — Delhi",
    quote:
      "I switched from three different apps to AcademyX. The reports alone are worth it — I know every centre's revenue and attendance from one dashboard.",
  },
  {
    name: "Fatima Sheikh",
    role: "Principal, Iqra Girls Academy — Pune",
    quote:
      "The exam module is brilliant. Auto-grading of MCQ tests and instant result cards have freed up our teachers to actually teach.",
  },
  {
    name: "Priya Patel",
    role: "Director, Navodaya Academy — Ahmedabad",
    quote:
      "Onboarding 300 students took one afternoon. Fee receipts, invoices and Razorpay collections all handled automatically.",
  },
  {
    name: "Abdul Rahman",
    role: "Administrator, Crescent Institute — Bengaluru",
    quote:
      "Support is genuinely fast, and the platform is built the way Indian coaching centres actually work. Highly recommended.",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <MarketingHeader />
      <section className="border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-20 md:py-24 text-center">
          <Badge className="mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            What academies say
          </Badge>
          <h1 className="font-bold text-4xl md:text-6xl tracking-tight text-text-heading max-w-3xl mx-auto leading-[1.1]">
            Loved by academies across India
          </h1>
          <p className="mt-6 text-lg text-text-muted max-w-2xl mx-auto">
            From single-classroom centres to multi-branch institutes.
          </p>
        </div>
      </section>
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col"
            >
              <div className="flex gap-1 text-tertiary mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-semibold text-sm">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-text-heading text-sm">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
