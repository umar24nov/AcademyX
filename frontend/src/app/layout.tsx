import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/use-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://academy-x-ivory.vercel.app"),
  title: {
    default: "AcademyX | The Operating System for Coaching Institutes",
    template: "%s | AcademyX",
  },
  description:
    "Multi-tenant SaaS platform for coaching institutes. Run your entire academy — students, teachers, courses, batches, live classes, exams, and payments — from a single platform.",
  openGraph: {
    title: "AcademyX | The Operating System for Coaching Institutes",
    description:
      "Multi-tenant SaaS platform for coaching institutes. Run your entire academy — students, teachers, courses, batches, live classes, exams, and payments — from a single platform.",
    url: "https://academy-x-ivory.vercel.app",
    siteName: "AcademyX",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AcademyX | The Operating System for Coaching Institutes",
    description:
      "Multi-tenant SaaS platform for coaching institutes. Run your entire academy — students, teachers, courses, batches, live classes, exams, and payments — from a single platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">{children}
        <Toaster />
      </body>
    </html>
  );
}
