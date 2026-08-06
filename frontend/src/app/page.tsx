"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";

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
  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <MarketingHeader />

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
