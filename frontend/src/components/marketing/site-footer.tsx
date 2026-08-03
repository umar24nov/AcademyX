"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  AtSign,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BrandLogo } from "@/components/layout/brand-logo";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Sign in", href: "/login" },
  { label: "Create an institute", href: "/register" },
];

const companyLinks = [
  { label: "About us", href: "/#" },
  { label: "Careers", href: "/#" },
  { label: "Contact", href: "/#" },
  { label: "Help & support", href: "/support" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/#" },
  { label: "Terms of Service", href: "/#" },
  { label: "Documentation", href: "/#" },
];

export function SiteFooter() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");

  const subscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmail("");
    toast({
      title: "Subscribed!",
      description: "We'll keep you posted on new AcademyX features.",
    });
  };

  return (
    <footer className="border-t border-border-subtle bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <BrandLogo boxClass="w-9 h-9 rounded-lg" iconClass="h-5 w-5" textClass="text-lg text-primary" />
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              The operating system for coaching institutes across India — students,
              teachers, courses, live classes, exams, payments and reports in one place.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Globe, label: "Website" },
                { icon: AtSign, label: "Social" },
                { icon: MessageCircle, label: "Community" },
              ].map(({ icon: IconCmp, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg border border-border-subtle bg-surface flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <IconCmp className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-text-heading mb-4">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-text-heading mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + contact */}
          <div>
            <h4 className="font-semibold text-text-heading mb-4">Stay updated</h4>
            <p className="text-sm text-text-muted mb-3">
              Get product updates and tips for running your academy.
            </p>
            <form onSubmit={subscribe} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institute.com"
                className="h-9"
                aria-label="Email for newsletter"
              />
              <Button type="submit" className="h-9 shrink-0">
                Join
              </Button>
            </form>
            <ul className="mt-5 space-y-2.5 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                Begumpet, Hyderabad, Telangana, India
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                hello@academyx.app
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © 2026 AcademyX. Made in India for coaching institutes.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-muted">
            {legalLinks.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
