"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/use-toast";
import { useLive } from "@/lib/live";
import { api } from "@/lib/api";

interface InstitutePlan {
  id: string;
  name: string;
  plan: string;
  status: string;
  subscriptionExpiry?: string | null;
  contactEmail?: string | null;
}

interface Payment {
  id: string;
  txId: string;
  student?: string | null;
  amount: number;
  method?: string;
  status?: string;
  date?: string;
  purpose?: string | null;
}

const plans = [
  { name: "Starter", price: 0, desc: "Up to 100 students", features: ["Core LMS", "1 admin", "Basic reports"] },
  { name: "Pro", price: 499, desc: "Up to 1,000 students", features: ["Everything in Starter", "Live classes", "Advanced reports"] },
  { name: "Enterprise", price: 1299, desc: "Unlimited students", features: ["Everything in Pro", "SSO & API access", "Priority support"] },
];

function fmtDate(d?: string): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BillingPage() {
  const { toast } = useToast();
  const institute = useLive<InstitutePlan | null>(
    async () => {
      try {
        const res = await api.get<{ institute?: InstitutePlan }>("/institutes");
        return res.institute ?? null;
      } catch {
        return null;
      }
    },
    null
  );
  const payments = useLive<Payment[]>(
    async () => {
      try {
        const res = await api.get<{ payments: Payment[] }>("/payments");
        return res.payments;
      } catch {
        return [];
      }
    },
    []
  );

  const plan = institute?.plan ?? "FREE";
  const planMeta = plans.find((p) => p.name.toLowerCase() === plan.toLowerCase()) ?? plans[0];

  const choosePlan = (name: string) => {
    toast({
      title: "Plan selected",
      description: `${name} plan upgrade requests are processed by the AcademyX team.`,
    });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription plan and view payment history."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>
                {institute?.name ?? "Your institute"} •{" "}
                <Badge variant={institute?.status === "ACTIVE" ? "success" : "warning"}>
                  {institute?.status ?? "—"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-4xl font-bold text-text-heading">{planMeta.name}</p>
                  <p className="text-sm text-text-muted mt-1">
                    ${planMeta.price}/month • {planMeta.desc}
                  </p>
                </div>
                <Badge variant="default" className="font-mono uppercase">{plan}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div
                    key={p.name}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      p.name === planMeta.name
                        ? "border-primary bg-primary/5"
                        : "border-border-subtle bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-on-surface">{p.name}</p>
                      <p className="font-mono text-sm text-text-muted">${p.price}/mo</p>
                    </div>
                    <ul className="space-y-1 text-xs text-text-muted flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <Icon name="check" className="h-3.5 w-3.5 text-success-green" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={p.name === planMeta.name ? "outline" : "default"}
                      size="sm"
                      disabled={p.name === planMeta.name}
                      onClick={() => choosePlan(p.name)}
                    >
                      {p.name === planMeta.name ? "Current Plan" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
              <CardDescription>Manage the card on file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border-subtle bg-surface-container-low flex items-center gap-3">
                <div className="h-10 w-14 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <Icon name="payments" className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">Visa •••• 4242</p>
                  <p className="text-xs text-text-muted">Expires 12/28</p>
                </div>
                <Badge variant="success">Default</Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "Not implemented", description: "Card management is handled externally." })}>
                <Icon name="add" className="h-4 w-4" />
                Add Payment Method
              </Button>
              <p className="text-xs text-text-muted">
                Invoices are generated automatically and emailed to {institute?.contactEmail ?? "your billing contact"}.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
            <CardDescription>Recent transactions against your institute account.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted">
                No payments recorded yet. Payments will appear here once students complete transactions.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 10).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.txId}</TableCell>
                      <TableCell className="font-medium text-on-surface">{p.student ?? "—"}</TableCell>
                      <TableCell className="text-text-muted">{p.purpose ?? "—"}</TableCell>
                      <TableCell className="font-mono text-right">${p.amount}</TableCell>
                      <TableCell className="text-text-muted">{p.method ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === "SUCCESS" ? "success" : p.status === "PENDING" ? "warning" : "destructive"}
                        >
                          {p.status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{fmtDate(p.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
