/** Formatting + small shared utilities for KasaBiz. */

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const nf0 = new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** GH₵1,250  — pass `decimals` for GH₵1,250.00 */
export const ghs = (n: number, decimals = 0) =>
  `GH₵${(decimals ? nf2 : nf0).format(Math.round(n * (decimals ? 1 : 1)) )}`.replace(
    /GH₵-/,
    "-GH₵"
  );

export const num = (n: number) => nf0.format(n);

export const pctOf = (part: number, whole: number) =>
  whole <= 0 ? 0 : Math.round((part / whole) * 100);

/* ------------------------------- dates ------------------------------- */

export const DAY = 86_400_000;

export const daysAgoISO = (days: number, hour = 10, minute = 0) => {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export const fmtDay = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, new Date(now.getTime() - DAY))) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);

export const fmtDateInput = (d: Date) => d.toISOString().slice(0, 10);

/* ------------------------------- identity ------------------------------ */

let counter = 0;
export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

const AV_COLORS = ["#1d5bd6", "#0e9f6e", "#d97706", "#0891b2", "#7c3aed", "#be185d", "#b57e04", "#1648ae"];
export const avatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/* ------------------------------ csv export ----------------------------- */

export const downloadCSV = (filename: string, header: string[], rows: (string | number)[][]) => {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------------------- payment method branding ---------------------- */

export const METHOD_META: Record<string, { short: string; dot: string }> = {
  Cash: { short: "Cash", dot: "#0e9f6e" },
  "MTN Mobile Money": { short: "MTN MoMo", dot: "#f7c500" },
  "Telecel Cash": { short: "Telecel", dot: "#e60000" },
  "AT Money": { short: "AT Money", dot: "#2b6cb0" },
  "Bank Transfer": { short: "Bank", dot: "#1d5bd6" },
  Card: { short: "Card", dot: "#7c3aed" },
  Credit: { short: "Credit", dot: "#d97706" },
};

export const PAYMENT_METHODS = [
  "Cash",
  "MTN Mobile Money",
  "Telecel Cash",
  "AT Money",
  "Bank Transfer",
  "Card",
];
