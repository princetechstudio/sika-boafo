/** Expenses — summaries, category breakdown, add/edit/delete. */
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flame, Pencil, Plus, Trash2, TrendingUp, Wallet, CalendarDays } from "lucide-react";
import {
  Badge, Button, Card, CardHead, ConfirmModal, EmptyState, Field, Input, Modal,
  PageHeader, Progress, Select, StatCard,
} from "../components/ui";
import { CHART } from "../components/charts";
import { useApp } from "../state/store";
import type { Expense } from "../data/mockData";
import { EXPENSE_CATEGORIES } from "../data/mockData";
import { cx, fmtDay, ghs, METHOD_META, PAYMENT_METHODS, uid } from "../lib/format";

const empty = { description: "", category: "Transport", amount: "", method: "Cash", date: "" };

export default function Expenses() {
  const { data, dispatch, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof empty, string>>>({});
  const [deleting, setDeleting] = useState<Expense | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") { openForm(null); params.delete("new"); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const stats = useMemo(() => {
    const today = data.expenses.filter((e) => new Date(e.date).toDateString() === now.toDateString());
    const month = data.expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const largest = month.reduce<Expense | null>((a, e) => (!a || e.amount > a.amount ? e : a), null);
    return {
      today: today.reduce((s, e) => s + e.amount, 0),
      month: month.reduce((s, e) => s + e.amount, 0),
      largest,
    };
  }, [data.expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    data.expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.expenses]); // eslint-disable-line react-hooks/exhaustive-deps
  const catMax = byCategory[0]?.[1] ?? 1;

  const rows = useMemo(
    () => data.expenses.filter((e) => category === "All" || e.category === category),
    [data.expenses, category]
  );

  const openForm = (e: Expense | null) => {
    setEditing(e);
    setForm(e
      ? { description: e.description, category: e.category, amount: String(e.amount), method: e.method, date: e.date.slice(0, 10) }
      : { ...empty, date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setFormOpen(true);
  };

  const save = () => {
    const errs: typeof errors = {};
    const amount = parseFloat(form.amount);
    if (form.description.trim().length < 2) errs.description = "Describe the expense.";
    if (isNaN(amount) || amount <= 0) errs.amount = "Enter an amount above 0.";
    if (!form.date) errs.date = "Pick a date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch({
      type: "EXPENSE_SAVE",
      expense: {
        id: editing?.id ?? uid("e"),
        description: form.description.trim(), category: form.category, amount,
        method: form.method, date: new Date(form.date + "T12:00:00").toISOString(),
      },
    });
    toast(editing ? "Expense updated." : "Expense recorded.");
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" sub="Every cedi out — tracked and categorised"
        actions={<Button onClick={() => openForm(null)}><Plus className="size-4" /> Add Expense</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Today's Expenses" value={stats.today} icon={<Wallet className="size-4" />} tone="warn" sub={<span>spent today</span>} />
        <StatCard label="This Month" value={stats.month} icon={<CalendarDays className="size-4" />} tone="brand" sub={<span>{now.toLocaleDateString("en-GB", { month: "long" })} total</span>} />
        <StatCard label="Largest Expense" value={stats.largest?.amount ?? 0} icon={<Flame className="size-4" />} tone="danger"
          sub={<span className="truncate block">{stats.largest ? stats.largest.description : "—"}</span>} />
      </div>

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-5">
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-line flex gap-2 overflow-x-auto no-scrollbar">
            {["All", ...EXPENSE_CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cx("chip shrink-0", category === c && "chip-on")}>{c}</button>
            ))}
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={<Wallet className="size-6" />} title="No expenses here"
              desc="Record rent, light bill, transport and more — they'll show up instantly." />
          ) : (
            <div className="tbl-wrap">
              <table className="tbl !min-w-[720px]">
                <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Payment Method</th><th>Date</th><th className="!text-right">Actions</th></tr></thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id}>
                      <td className="font-bold text-ink">{e.description}</td>
                      <td><Badge tone="neutral">{e.category}</Badge></td>
                      <td className="font-bold text-danger tnum">{ghs(e.amount)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub">
                          <span className="size-2 rounded-full" style={{ background: METHOD_META[e.method]?.dot }} />
                          {METHOD_META[e.method]?.short ?? e.method}
                        </span>
                      </td>
                      <td className="text-sub whitespace-nowrap">{fmtDay(e.date)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openForm(e)} aria-label="Edit expense" className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Pencil className="size-4" /></button>
                          <button onClick={() => setDeleting(e)} aria-label="Delete expense" className="p-2 rounded-lg text-sub hover:text-danger hover:bg-danger-soft transition"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHead title="Where it goes" sub="This month by category" />
          <div className="px-5 pb-5 pt-3 space-y-3.5">
            {byCategory.length === 0 && <p className="text-sm text-sub">No expenses this month yet.</p>}
            {byCategory.map(([cat, amt], i) => (
              <div key={cat}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[13px] font-bold text-ink">{cat}</span>
                  <span className="text-[12px] font-bold text-sub tnum">{ghs(amt)}</span>
                </div>
                <div className="h-2 rounded-full bg-line overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(amt / catMax) * 100}%`, background: CHART.pie[i % CHART.pie.length] }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit expense" : "Add expense"}
        footer={<><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Save Changes" : "Record Expense"}</Button></>}>
        <div className="space-y-4">
          <Field label="Description" error={errors.description}>
            <Input value={form.description} invalid={!!errors.description} placeholder="e.g. Delivery from Makola" onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Amount (GH₵)" error={errors.amount}>
              <Input type="number" min="0" step="0.01" value={form.amount} invalid={!!errors.amount} placeholder="120" onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Payment method">
              <Select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Date" error={errors.date}>
              <Input type="date" value={form.date} invalid={!!errors.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) { dispatch({ type: "EXPENSE_DELETE", id: deleting.id }); toast("Expense deleted.", "info"); } }}
        title="Delete expense?" message={`"${deleting?.description}" (${deleting ? ghs(deleting.amount) : ""}) will be removed from your records.`} />
    </div>
  );
}
