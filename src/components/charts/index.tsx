/** Chart primitives — Recharts wrappers with the KasaBiz palette. */
import React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card } from "../ui";

export const CHART = {
  brand: "#1d5bd6",
  brandDeep: "#1648ae",
  ok: "#0e9f6e",
  warn: "#d97706",
  danger: "#dc2626",
  info: "#0891b2",
  gold: "#f0a500",
  navy: "#0a1f44",
  pie: ["#1d5bd6", "#f0a500", "#0e9f6e", "#0891b2", "#7c3aed", "#be185d", "#d97706", "#64748b"],
};

const fmtTick = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`);

function TooltipBox({ active, payload, label, money = true }: {
  active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string; money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-pop text-xs">
      {label && <p className="font-bold text-ink mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-sub whitespace-nowrap">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-bold text-ink tnum">
            {money ? `GH₵${Number(p.value).toLocaleString("en-GH")}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function ChartCard({ title, sub, action, children, className }: {
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-2 px-5 pt-4 pb-1">
        <div>
          <h3 className="font-display font-bold text-[15px] text-ink">{title}</h3>
          {sub && <p className="text-xs text-sub mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function AreaMoney({ data, dataKey = "sales", color = CHART.brand, height = 220, name }: {
  data: Array<Record<string, number | string>>; dataKey?: string; color?: string; height?: number; name?: string;
}) {
  const gid = `g-${dataKey}-${color.replace("#", "")}`;
  return (
    <div style={{ height }} className="px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--t-line)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} tickFormatter={fmtTick} width={44} />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--t-line2)" }} />
          <Area type="monotone" dataKey={dataKey} name={name ?? dataKey} stroke={color} strokeWidth={2.4} fill={`url(#${gid})`} activeDot={{ r: 4, strokeWidth: 0 }} animationDuration={700} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsMoney({ data, dataKey = "expenses", color = CHART.warn, height = 220, name }: {
  data: Array<Record<string, number | string>>; dataKey?: string; color?: string; height?: number; name?: string;
}) {
  return (
    <div style={{ height }} className="px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="var(--t-line)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} tickFormatter={fmtTick} width={44} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--t-line)", opacity: 0.4 }} />
          <Bar dataKey={dataKey} name={name ?? dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={26} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineMoney({ data, dataKey = "profit", color = CHART.ok, height = 220, name }: {
  data: Array<Record<string, number | string>>; dataKey?: string; color?: string; height?: number; name?: string;
}) {
  return (
    <div style={{ height }} className="px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="var(--t-line)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} tickFormatter={fmtTick} width={44} />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--t-line2)" }} />
          <Line type="monotone" dataKey={dataKey} name={name ?? dataKey} stroke={color} strokeWidth={2.4} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} animationDuration={700} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, height = 200, money = true, innerLabel }: {
  data: Array<{ name: string; value: number }>; height?: number; money?: boolean; innerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} strokeWidth={0} animationDuration={700}>
            {data.map((_, i) => <Cell key={i} fill={CHART.pie[i % CHART.pie.length]} />)}
          </Pie>
          <Tooltip content={<TooltipBox money={money} />} />
        </PieChart>
      </ResponsiveContainer>
      {innerLabel && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <p className="font-display font-extrabold text-lg text-ink tnum">{money ? `GH₵${Math.round(total).toLocaleString("en-GH")}` : total.toLocaleString("en-GH")}</p>
            <p className="text-[11px] font-semibold text-faint">{innerLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HBars({ data, color = CHART.brand, height = 240, money = false }: {
  data: Array<{ name: string; value: number }>; color?: string; height?: number; money?: boolean;
}) {
  return (
    <div style={{ height }} className="px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--t-line)" strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--t-faint)" }} tickLine={false} axisLine={false} tickFormatter={fmtTick} />
          <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: "var(--t-sub)" }} tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox money={money} />} cursor={{ fill: "var(--t-line)", opacity: 0.4 }} />
          <Bar dataKey="value" name="count" fill={color} radius={[0, 5, 5, 0]} maxBarSize={16} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tiny inline sparkline for stat cards. */
export function Spark({ data, dataKey, color, width = 84, height = 34 }: {
  data: Array<Record<string, number | string>>; dataKey: string; color: string; width?: number; height?: number;
}) {
  const gid = `sp-${dataKey}-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.8} fill={`url(#${gid})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </svg>
  );
}
