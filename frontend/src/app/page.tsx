"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: "menu_book",
    title: "Curriculum Builder",
    desc: "Design courses with modules, lessons and lectures. Reuse content across batches.",
  },
  {
    icon: "video",
    title: "Live Classrooms",
    desc: "Launch 100ms-powered live sessions with automatic attendance and recordings.",
  },
  {
    icon: "assignment",
    title: "Exams & Assignments",
    desc: "MCQ and subjective exams with auto-grading, plus submission workflows.",
  },
  {
    icon: "payments",
    title: "Payments & Invoices",
    desc: "Razorpay-backed collections, invoices, refunds and subscription billing.",
  },
  {
    icon: "verified_user",
    title: "Smart Attendance",
    desc: "Track attendance across live classes, batches and teachers automatically.",
  },
  {
    icon: "bar_chart",
    title: "Analytics & Reports",
    desc: "Revenue, attendance, course performance and institute growth dashboards.",
  },
];

const stats = [
  { value: "2,400+", label: "Institutes onboard" },
  { value: "1.8L+", label: "Students managed" },
  { value: "4.8/5", label: "Average rating" },
  { value: "99.9%", label: "Platform uptime" },
];

const trustedInstitutes = [
  "Sunrise Academy",
  "Al-Madina Coaching Centre",
  "Sharma Classes",
  "Navodaya Academy",
  "Crescent Institute",
  "Iqra Girls Academy",
];

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

const plans = [
  {
    name: "Starter",
    price: "₹4,999",
    period: "/mo",
    desc: "For a single coaching institute getting started.",
    features: ["Up to 200 students", "3 active courses", "Basic analytics", "Email support"],
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹12,999",
    period: "/mo",
    desc: "For growing institutes running full operations.",
    features: [
      "Up to 1,000 students",
      "Unlimited courses & batches",
      "Live classes & recordings",
      "Payments & invoices",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For chains and multi-branch institutes.",
    features: [
      "Unlimited students",
      "Custom domain & branding",
      "API access",
      "Dedicated success manager",
      "SLA & onboarding",
    ],
    highlight: false,
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <BrandLogo boxClass="w-9 h-9 rounded-lg" iconClass="h-5 w-5" textClass="text-xl" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-1">
                  {["Features", "Testimonials", "Pricing", "FAQ"].map((label) => (
                    <SheetClose asChild key={label}>
                      <a
                        href={`#${label.toLowerCase()}`}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                      >
                        {label}
                      </a>
                    </SheetClose>
                  ))}
                  <div className="mt-3 border-t border-border-subtle pt-4 flex flex-col gap-2 px-1">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-24 md:py-32 text-center relative">
          <Badge className="mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            The Operating System for Coaching Institutes
          </Badge>
          <h1 className="font-bold text-5xl md:text-7xl tracking-tight text-text-heading max-w-4xl mx-auto leading-[1.05]">
            Run your entire coaching academy on{" "}
            <span className="text-primary">one platform</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            Students, teachers, courses, live classes, exams, payments and reports —
            AcademyX unifies everything your institute needs to grow.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-text-muted">
            {["No credit card required", "14-day free trial", "Setup in minutes"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-green" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border-subtle bg-surface-dim/50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-bold text-4xl tracking-tight text-text-heading">{s.value}</p>
              <p className="text-sm text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          <p className="text-center text-sm text-text-muted mb-6">
            Trusted by coaching institutes across India
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {trustedInstitutes.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full border border-border-subtle bg-surface text-sm text-on-surface-variant"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl tracking-tight text-text-heading">
              Everything your institute needs
            </h2>
            <p className="text-text-muted mt-4 text-lg max-w-2xl mx-auto">
              A complete SaaS toolkit purpose-built for coaching institutes — no duct tape, no spreadsheet chaos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group glass-card rounded-xl p-6 hover:border-primary/30 hover:indigo-glow transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-text-heading mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border-subtle bg-surface-dim/50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl tracking-tight text-text-heading">
              Loved by academies across India
            </h2>
            <p className="text-text-muted mt-4 text-lg">
              From single-classroom centres to multi-branch institutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col">
                <div className="flex gap-1 text-tertiary mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-semibold text-sm">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-text-heading text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl tracking-tight text-text-heading">Transparent Pricing</h2>
            <p className="text-text-muted mt-4 text-lg">Scale as your institute grows. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  p.highlight
                    ? "rounded-xl border border-primary/40 bg-surface p-8 flex flex-col relative shadow-xl shadow-primary/10"
                    : "rounded-xl border border-border bg-surface p-8 flex flex-col"
                }
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <h3 className="font-semibold text-lg text-text-heading">{p.name}</h3>
                <p className="text-sm text-text-muted mt-1 mb-6">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-bold text-5xl text-text-heading tracking-tight">{p.price}</span>
                  <span className="text-text-muted">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-on-surface-variant">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={p.highlight ? "default" : "outline"} className="w-full" asChild>
                  <Link href="/register">Choose {p.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border-subtle bg-surface-dim/50">
        <div className="max-w-[768px] mx-auto px-4 md:px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="font-bold text-4xl tracking-tight text-text-heading">
              Frequently asked questions
            </h2>
            <p className="text-text-muted mt-4 text-lg">
              Everything you need to know before starting your free trial.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className={cn(
                    "rounded-xl border bg-surface overflow-hidden transition-colors",
                    open ? "border-primary/40" : "border-border-subtle"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-text-heading text-sm">{f.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-text-muted shrink-0 transition-transform",
                        open && "rotate-180 text-primary"
                      )}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{f.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-24 text-center">
          <h2 className="font-bold text-4xl md:text-5xl tracking-tight text-text-heading max-w-2xl mx-auto">
            Ready to scale your academy?
          </h2>
          <p className="text-text-muted mt-4 text-lg max-w-xl mx-auto">
            Join thousands of coaching institutes running on AcademyX.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/register">
                Create your institute
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
