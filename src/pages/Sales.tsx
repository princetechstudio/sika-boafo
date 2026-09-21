/** Sales history with filters + summary. */
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Receipt, SearchX, ShoppingCart, Wallet, Zap, ShieldAlert } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, SearchBox, Select, StatCard, statusTone } from "../components/ui";
import { useApp } from "../state/store";
import { authService } from "../services/authService";
import type { Sale } from "../data/mockData";
import { debtStatus, saleOutstanding } from "../services/dataService";
import { fmtDay, ghs, METHOD_META } from "../lib/format";
import { ReceiptModal } from "./Receipts";

export default function Sales() {
  const { data, dispatch, toast } = useApp();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [open, setOpen] = useState<Sale | null>(null);
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [reason, setReason] = useState("");
  const { user } = authService.getSession() ?? { user: { name: "Business owner" } };

  const stats = useMemo(() => {
    const now = new Date();
    const today = data.sales.filter((s) => !s.voidedAt && new Date(s.date).toDateString() === now.toDateString());
    const month = data.sales.filter((s) => { const d = new Date(s.date); return !s.voidedAt && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const total = month.reduce((s, x) => s + x.total, 0);
    return {
      today: today.reduce((s, x) => s + x.total, 0),
      month: total,
      count: month.length,
      avg: month.length ? total / month.length : 0,
    };
  }, [data.sales]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.sales.filter((s) => {
      const st = debtStatus(s);
      const stOk = status === "All" || (status === "Paid" ? st === "Paid" : st !== "Paid");
      return stOk && (method === "All" || s.method === method) &&
        (!q || s.receipt.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q));
    });
  }, [data.sales, query, status, method]);

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" sub="Every transaction across your till"
        actions={<Button onClick={() => nav("/sales/new")}><Zap className="size-4" /> New Sale</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Today" value={stats.today} icon={<ShoppingCart className="size-4" />} tone="brand" sub={<span>across the till</span>} />
        <StatCard label="This Month" value={stats.month} icon={<Wallet className="size-4" />} tone="ok" sub={<span>{stats.count} transactions</span>} />
        <StatCard label="Transactions" value={stats.count} prefix="" icon={<Receipt className="size-4" />} tone="info" sub={<span>this month</span>} />
        <StatCard label="Avg. Sale" value={stats.avg} icon={<Zap className="size-4" />} tone="gold" sub={<span>per receipt</span>} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-line">
          <SearchBox value={query} onChange={setQuery} placeholder="Search receipt # or customer…" className="flex-1" />
          <div className="flex gap-2">
            {["All", "Paid", "Credit"].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`chip ${status === s ? "chip-on" : ""}`}>{s}</button>
            ))}
            <Select value={method} onChange={(e) => setMethod(e.target.value)} className="!w-auto">
              <option value="All">All methods</option>
              {Object.keys(METHOD_META).map((m) => <option key={m}>{m}</option>)}
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<SearchX className="size-6" />} title="No sales recorded yet."
            desc={query || status !== "All" || method !== "All" ? "No sales match these filters." : "Record your first sale and it will show up here instantly."}
            action={<Button onClick={() => nav("/sales/new")}><Zap className="size-4" /> Record a sale</Button>} />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl !min-w-[880px]">
              <thead><tr><th>Receipt</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Date</th><th>Status</th><th className="!text-right">Actions</th></tr></thead>
              <tbody>
                {rows.map((s) => {
                  const st = debtStatus(s);
                  const out = saleOutstanding(s);
                  return (
                    <tr key={s.id}>
                      <td className="font-mono font-semibold text-brand">#{s.receipt}</td>
                      <td className="font-semibold text-ink">{s.customerName}</td>
                      <td className="text-sub max-w-[200px] truncate">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                      <td className="font-bold text-ink tnum">{ghs(s.total)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub">
                          <span className="size-2 rounded-full" style={{ background: METHOD_META[s.method]?.dot }} />
                          {METHOD_META[s.method]?.short ?? s.method}
                        </span>
                      </td>
                      <td className="text-sub whitespace-nowrap">{fmtDay(s.date)}</td>
                      <td><Badge tone={s.voidedAt ? "danger" : statusTone(out <= 0 ? "Paid" : st)}>{s.voidedAt ? "Voided" : out <= 0 ? "Paid" : st}</Badge></td>
                      <td className="text-right">
                        <button onClick={() => setOpen(s)} aria-label={`View receipt ${s.receipt}`}
                          className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Eye className="size-4" /></button>
                        {!s.voidedAt && <button onClick={() => { setVoiding(s); setReason(""); }} aria-label={`Void sale ${s.receipt}`}
                          className="p-2 rounded-lg text-sub hover:text-danger hover:bg-danger-soft transition"><ShieldAlert className="size-4" /></button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && <ReceiptModal sale={open} onClose={() => setOpen(null)} />}
      <Card className="border-danger/20 bg-danger-soft/30">
        <div className="flex items-start gap-3 p-5">
          <ShieldAlert className="size-5 text-danger mt-0.5 shrink-0" />
          <div>
            <h2 className="font-display font-bold text-ink">Sales protection is active</h2>
            <p className="text-sm text-sub mt-1">Sales are never permanently deleted. Voiding requires a reason, restores stock, and records the staff member and timestamp in the audit trail.</p>
          </div>
        </div>
        {(data.auditLogs ?? []).length > 0 && <div className="border-t border-danger/10 px-5 py-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-danger">Recent void activity</p>
          {(data.auditLogs ?? []).slice(0, 3).map((log) => <div key={log.id} className="text-xs text-sub flex flex-wrap gap-x-2"><b className="text-ink">{log.entityLabel}</b><span>voided by {log.actor}</span><span>· {log.reason}</span></div>)}
        </div>}
      </Card>
      <Modal open={!!voiding} onClose={() => setVoiding(null)} title="Void this sale?" sub="This will remain visible in your records and be reported to management."
        footer={<><Button variant="secondary" onClick={() => setVoiding(null)}>Cancel</Button><Button variant="danger" disabled={reason.trim().length < 5} onClick={() => {
          if (!voiding || reason.trim().length < 5) return;
          dispatch({ type: "SALE_VOID", saleId: voiding.id, actor: user.name, reason: reason.trim(), date: new Date().toISOString() });
          toast(`Sale ${voiding.receipt} voided and added to the audit trail.`, "warning");
          setVoiding(null);
        }}>Void and report</Button></>}>
        <div className="space-y-4">
          <div className="rounded-lg bg-danger-soft p-3 text-sm text-danger-deep">Receipt <b>#{voiding?.receipt}</b> for <b>{voiding?.customerName}</b> will stay in the ledger. Stock will be returned.</div>
          <Field label="Reason for voiding" hint="Required for accountability (minimum 5 characters).">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Customer returned items…" autoFocus />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
