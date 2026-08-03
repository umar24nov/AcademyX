"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SeriesPoint = { [key: string]: string | number };

const tooltipStyle = {
  backgroundColor: "#201f22",
  border: "1px solid #27272a",
  borderRadius: "0.75rem",
  color: "#e5e1e4",
  fontSize: "13px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
};

export function RevenueBarChart({
  data,
  xKey = "month",
  yKey = "revenue",
  color = "#8083ff",
  height = 256,
}: {
  data: SeriesPoint[];
  xKey?: string;
  yKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey={xKey} stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  xKey,
  yKey,
  color = "#8083ff",
  height = 256,
}: {
  data: SeriesPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey={xKey} stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaTrendChart({
  data,
  xKey,
  yKey,
  color = "#8083ff",
  height = 256,
}: {
  data: SeriesPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey={xKey} stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#grad-${yKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MetricCardHeader({
  title,
  ranges = ["Last 6 Months", "Year to Date", "This Quarter"],
}: {
  title: string;
  ranges?: string[];
}) {
  const [range, setRange] = useState(ranges[0]);
  return (
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-xl font-semibold text-text-heading">{title}</h4>
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-surface border-border-subtle">
          <SelectValue placeholder={range} />
        </SelectTrigger>
        <SelectContent>
          {ranges.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
