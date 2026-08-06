"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { RowActionsMenu } from "@/components/dashboard/row-menu";
import { useToast } from "@/components/ui/use-toast";
import { useLive, useStoredUser } from "@/lib/live";
import { downloadCsv } from "@/lib/csv";
import { fetchFinancials, mockFinancialsData } from "@/lib/live-data";
import { Search } from "lucide-react";

export default function FinancialsPage() {
  const { toast } = useToast();
  const { payments, revenueSeries } = useLive(fetchFinancials, mockFinancialsData);
  const user = useStoredUser();
  const canManageInvoices = user?.role === "INSTITUTE_ADMIN";

  const exportRow = (p: (typeof payments)[number]) => {
    downloadCsv(
      `receipt-${p.txId}`,
      ["Receipt", "Student", "Course", "Amount", "Method", "Status", "Date"],
      [[p.txId, p.student, p.course, p.amount, p.method, p.status, p.date]]
    );
    toast({ title: "Receipt exported", description: `${p.txId} exported to CSV.` });
  };
  const [tab, setTab] = React.useState("payments");
  const [status, setStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matches =
      p.student.toLowerCase().includes(q) || p.course.toLowerCase().includes(q) || p.txId.toLowerCase().includes(q);
    const matchesStatus = status === "all" || p.status.toLowerCase() === status;
    return matches && matchesStatus;
  });

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const collected = payments.filter((p) => p.status === "Success").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Financials"
          description="Track payments, invoices and revenue across your institute."
          actions={
            canManageInvoices ? (
              <Button>
                <Icon name="add" className="h-4 w-4" />
                Create Invoice
              </Button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon="payments" label="Total Revenue" value={`₹${(total / 100000).toFixed(1)}L`} />
          <StatCard icon="verified_user" label="Collected" value={`₹${(collected / 100000).toFixed(1)}L`} />
          <StatCard icon="hourglass_top" label="Pending" value={`₹${(pending / 100000).toFixed(1)}L`} />
        </div>

        <Tabs defaultValue="payments" value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  className="pl-10"
                  placeholder="Search by student, course or receipt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-primary">{p.txId}</TableCell>
                        <TableCell className="font-medium text-on-surface">{p.student}</TableCell>
                        <TableCell className="text-text-muted">{p.course}</TableCell>
                        <TableCell className="font-mono font-medium">₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-text-muted">{p.date}</TableCell>
                        <TableCell className="text-text-muted">{p.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={p.status === "Success" ? "success" : p.status === "Pending" ? "warning" : "destructive"}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <RowActionsMenu
                            iconClassName="h-5 w-5"
                            triggerClassName="h-9 w-9"
                            actions={[
                              {
                                label: "View Invoice",
                                icon: "visibility",
                                onSelect: () =>
                                  toast({
                                    title: p.txId,
                                    description: `${p.student} • ${p.course} • ₹${p.amount.toLocaleString()} • ${p.status}`,
                                  }),
                              },
                              {
                                label: "Download Receipt",
                                icon: "download",
                                onSelect: () => exportRow(p),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 6).map((p) => (
                      <TableRow key={`inv-${p.id}`}>
                        <TableCell className="font-mono text-primary">INV-2025-{String(p.id).padStart(4, "0")}</TableCell>
                        <TableCell className="font-medium text-on-surface">{p.student}</TableCell>
                        <TableCell className="font-mono font-medium">₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-text-muted">{p.date}</TableCell>
                        <TableCell className="text-text-muted">31 Aug 2025</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "Success" ? "success" : "warning"}>
                            {p.status === "Success" ? "Paid" : "Due"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-2">
                  {revenueSeries.slice(-12).map((r) => (
                    <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t-md bg-primary/20 hover:bg-primary/40 transition-colors" style={{ height: `${r.revenue / 20}px` }} />
                      <span className="text-[10px] text-text-muted font-mono">{r.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-xl font-bold text-text-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
