/** KasaBiz UI kit — small, reusable, accessible primitives. */
import React, { useEffect, useId, useRef } from "react";
import { X, Search, Inbox } from "lucide-react";
import { avatarColor, cx, initials } from "../../lib/format";
import { useCountUp } from "../../lib/hooks";

/* --------------------------------- Button --------------------------------- */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "gold" | "navy";
const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep active:translate-y-px shadow-sm",
  navy: "bg-navy text-white hover:bg-navy3 active:translate-y-px shadow-sm",
  secondary: "bg-card text-ink border border-line hover:border-line2 hover:bg-card2 active:translate-y-px",
  ghost: "text-sub hover:bg-card2 hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger-deep active:translate-y-px shadow-sm",
  success: "bg-ok text-white hover:bg-ok-deep active:translate-y-px shadow-sm",
  gold: "bg-gold text-navy hover:bg-gold-deep hover:text-white active:translate-y-px shadow-sm",
};

export function Button({
  variant = "primary", size = "md", className, loading, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; size?: "sm" | "md" | "lg"; loading?: boolean;
}) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        size === "sm" && "text-[13px] px-3 py-1.5",
        size === "md" && "text-sm px-4 py-2.5",
        size === "lg" && "text-[15px] px-6 py-3",
        btnStyles[variant],
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("animate-spin", className ?? "size-5")} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------- Badge --------------------------------- */

type Tone = "ok" | "warn" | "danger" | "info" | "brand" | "gold" | "neutral" | "navy";
const toneStyles: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok-deep",
  warn: "bg-warn-soft text-warn-deep",
  danger: "bg-danger-soft text-danger-deep",
  info: "bg-info-soft text-info",
  brand: "bg-brand-soft text-brand-deep",
  gold: "bg-gold-soft text-gold-deep",
  navy: "bg-navy text-white",
  neutral: "bg-card2 text-sub",
};

export function Badge({ tone = "neutral", dot, children, className }: {
  tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", toneStyles[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current animate-pulse-dot" />}
      {children}
    </span>
  );
}

export const statusTone = (s: string): Tone =>
  s === "Paid" || s === "In Stock" || s === "Active" || s === "Completed"
    ? "ok"
    : s === "Overdue" || s === "Out of Stock" || s === "Suspended"
      ? "danger"
      : s === "Pending" || s === "Low Stock" || s === "Partial" || s === "Partially Paid" || s === "Credit" || s === "Invited"
        ? "warn"
        : "brand";

/* ---------------------------------- Card ---------------------------------- */

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card", className)} {...rest}>{children}</div>;
}

export function CardHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-1">
      <div>
        <h3 className="font-display font-bold text-[17px] text-ink">{title}</h3>
        {sub && <p className="text-[13px] text-sub mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* -------------------------------- StatCard --------------------------------- */

export function StatCard({ label, value, prefix = "GH₵", icon, tone = "brand", sub, spark }: {
  label: string; value: number; prefix?: string; icon: React.ReactNode;
  tone?: Tone; sub?: React.ReactNode; spark?: React.ReactNode;
}) {
  const animated = useCountUp(value);
  const display = prefix === "GH₵" ? `GH₵${Math.round(animated).toLocaleString("en-GH")}` : `${Math.round(animated).toLocaleString("en-GH")}${prefix ? " " + prefix : ""}`;
  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-3 min-w-0 group hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-sub truncate">{label}</span>
        <span className={cx("shrink-0 grid place-items-center size-9 rounded-lg transition-transform group-hover:scale-110", toneStyles[tone])}>{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-extrabold text-[22px] sm:text-2xl leading-none text-ink tnum truncate">{display}</p>
          {sub && <div className="text-xs text-sub mt-1.5">{sub}</div>}
        </div>
        {spark && <div className="shrink-0 opacity-80">{spark}</div>}
      </div>
    </Card>
  );
}

/* ---------------------------------- Modal --------------------------------- */

export function Modal({ open, onClose, title, sub, children, footer, wide, id }: {
  open: boolean; onClose: () => void; title?: React.ReactNode; sub?: string;
  children: React.ReactNode; footer?: React.ReactNode; wide?: boolean; id?: string;
}) {
  const labelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={title ? labelId : undefined}>
      <div className="absolute inset-0 bg-navy2/60 backdrop-blur-[2px] animate-fade-in no-print" onClick={onClose} />
      <div
        ref={panelRef} tabIndex={-1} id={id}
        className={cx(
          "relative w-full bg-card border border-line shadow-pop outline-none animate-scale-in",
          "rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[86vh] flex flex-col",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        {title !== undefined && (
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3 border-b border-line no-print">
            <div>
              <h2 id={labelId} className="font-display font-bold text-lg text-ink">{title}</h2>
              {sub && <p className="text-[13px] text-sub mt-0.5">{sub}</p>}
            </div>
            <button onClick={onClose} aria-label="Close dialog" className="p-1.5 -m-1 rounded-lg text-sub hover:text-ink hover:bg-card2 transition">
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 grow">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-line bg-card2/60 rounded-b-2xl no-print flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", tone = "danger" }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; confirmLabel?: string; tone?: "danger" | "primary";
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }>
      <p className="text-sm text-sub leading-relaxed">{message}</p>
    </Modal>
  );
}

/* ---------------------------------- Forms --------------------------------- */

export function Field({ label, error, hint, children, className }: {
  label: string; error?: string; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="lbl">{label}</label>
      {children}
      {error ? <p className="text-xs font-medium text-danger mt-1">{error}</p>
        : hint ? <p className="text-xs text-faint mt-1">{hint}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...rest }, ref) => (
    <input ref={ref} className={cx("inp", invalid && "inp-err", className)} {...rest} />
  )
);
Input.displayName = "Input";

export function Select({ className, invalid, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cx("inp appearance-none bg-no-repeat bg-[right_0.7rem_center] bg-[length:14px] pr-8", invalid && "inp-err", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b98b3' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
      {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("inp min-h-20 resize-y", className)} {...rest} />;
}

export function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 w-full text-left group">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {desc && <span className="block text-xs text-sub mt-0.5">{desc}</span>}
      </span>
      <span className={cx("relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200", checked ? "bg-ok" : "bg-line2")}>
        <span className={cx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200", checked ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-faint pointer-events-none" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Search…"}
        aria-label={placeholder ?? "Search"} className="inp pl-9" />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-faint hover:text-ink transition">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */

export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: { id: T; label: string; icon?: React.ReactNode }[]; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div role="tablist" className={cx("flex gap-1 overflow-x-auto no-scrollbar border-b border-line", className)}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx(
            "relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
            value === t.id ? "text-brand" : "text-sub hover:text-ink"
          )}>
          {t.icon}{t.label}
          {value === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { id: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-card2 p-0.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cx("px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all",
            value === o.id ? "bg-card text-ink shadow-sm border border-line" : "text-sub hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({ icon, title, desc, action, className }: {
  icon?: React.ReactNode; title: string; desc?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in", className)}>
      <div className="grid place-items-center size-14 rounded-2xl bg-card2 border border-line text-faint mb-4">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <h3 className="font-display font-bold text-ink">{title}</h3>
      {desc && <p className="text-sm text-sub mt-1 max-w-sm leading-relaxed">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* --------------------------------- Avatar --------------------------------- */

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cx("inline-grid place-items-center rounded-full text-white font-bold shrink-0 select-none",
        size === "sm" && "size-7 text-[10px]", size === "md" && "size-9 text-xs", size === "lg" && "size-12 text-sm", className)}
      style={{ background: avatarColor(name) }} aria-hidden>
      {initials(name)}
    </span>
  );
}

/* ------------------------------- ProgressBar ------------------------------- */

export function Progress({ value, tone = "brand", className }: { value: number; tone?: Tone; className?: string }) {
  const colors: Record<string, string> = { brand: "bg-brand", ok: "bg-ok", warn: "bg-warn", danger: "bg-danger", gold: "bg-gold", info: "bg-info", neutral: "bg-line2", navy: "bg-navy" };
  return (
    <div className={cx("h-1.5 w-full rounded-full bg-line overflow-hidden", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full rounded-full transition-all duration-700", colors[tone])} style={{ width: `${Math.min(100, Math.max(2, value))}%`, animation: "grow-w 0.8s cubic-bezier(0.22,0.9,0.3,1)" }} />
    </div>
  );
}

/* -------------------------------- PageHeader ------------------------------- */

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5 animate-fade-up">
      <div>
        <h1 className="font-display font-extrabold text-[22px] sm:text-[26px] text-ink leading-tight">{title}</h1>
        {sub && <p className="text-sm text-sub mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------- Kente accent ------------------------------ */

export function KenteBar({ className }: { className?: string }) {
  return <div aria-hidden className={cx("kente h-1 rounded-full", className)} />;
}

/* ------------------------------ Money display ------------------------------ */

export function Money({ value, className, decimals = 0 }: { value: number; className?: string; decimals?: number }) {
  return (
    <span className={cx("tnum font-semibold", className)}>
      GH₵{(decimals ? value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(value).toLocaleString("en-GH"))}
    </span>
  );
}
