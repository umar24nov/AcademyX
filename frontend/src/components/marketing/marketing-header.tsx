"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <BrandLogo boxClass="w-9 h-9 rounded-lg" iconClass="h-5 w-5" textClass="text-xl" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Sign in
          </Link>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border-subtle text-on-surface"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <SheetClose asChild key={l.label}>
                    <Link
                      href={l.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
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
  );
}
