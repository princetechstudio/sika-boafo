/** Customer book — stats, table, detail drawer, add/edit. */
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Eye, MapPin, Pencil, Phone, Plus, SearchX, Users, Wallet } from "lucide-react";
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader,
  SearchBox, Select, StatCard, statusTone,
} from "../components/ui";
import { useApp } from "../state/store";
import type { Customer } from "../data/mockData";
import { GH_REGIONS } from "../data/mockData";
import { debtStatus, getCustomerStats, getDebtors } from "../services/dataService";
import { fmtDate, fmtDay, ghs, METHOD_META, uid } from "../lib/format";
import { ReceiptModal } from "./Receipts";
import type { Sale } from "../data/mockData";

const empty = { name: "", phone: "", city: "", region: "Greater Accra", email: "" };

export default function Customers() {
  const { data, dispatch, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof empty, string>>>({});
  const [detail, setDetail] = useState<Customer | null>(null);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") { openForm(null); params.delete("new"); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debtors = useMemo(() => getDebtors(data), [data]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.customers
      .map((c) => ({ c, stats: getCustomerStats(data, c.id) }))
      .filter(({ c }) => !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")))
      .sort((a, b) => b.stats.totalPurchases - a.stats.totalPurchases);
  }, [data, query]);

  const active = data.customers.filter((c) => getCustomerStats(data, c.id).sales.length > 0).length;

  const openForm = (c: Customer | null) => {
    setEditing(c);
    setForm(c ? { name: c.name, phone: c.phone, city: c.city, region: c.region, email: c.email ?? "" } : empty);
    setErrors({});
    setFormOpen(true);
  };

  const save = () => {
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = "Name is required.";
    if (!/^0\d{2}\s?\d{3}\s?\d{4}$/.test(form.phone.trim())) errs.phone = "Use a Ghana number, e.g. 024 417 8823.";
    if (!form.city.trim()) errs.city = "City or town is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch({
      type: "CUSTOMER_SAVE",
      customer: {
        id: editing?.id ?? crypto.randomUUID(), name: form.name.trim(), phone: form.phone.trim(),
        city: form.city.trim(), region: form.region, email: form.email.trim() || undefined,
        createdAt: editing?.createdAt ?? new Date().toISOString(),
      },
    });
    toast(editing ? "Customer updated." : "Customer added successfully.");
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" sub="Your book of regulars — history, contacts and balances"
        actions={<Button onClick={() => openForm(null)}><Plus className="size-4" /> Add Customer</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total Customers" value={data.customers.length} prefix="" icon={<Users className="size-4" />} tone="brand" sub={<span>in your book</span>} />
        <StatCard label="Active Customers" value={active} prefix="" icon={<Wallet className="size-4" />} tone="ok" sub={<span>with purchases</span>} />
        <StatCard label="Customers with Debt" value={debtors.length} prefix="" icon={<Wallet className="size-4" />} tone="danger"
          sub={<span>{ghs(debtors.reduce((s, d) => s + d.outstanding, 0))} outstanding</span>} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-line">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by name or phone…" />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<SearchX className="size-6" />} title="No customers found"
            desc={query ? "Try a different name or phone number." : "Add your first customer to start building your book."}
            action={!query ? <Button onClick={() => openForm(null)}><Plus className="size-4" /> Add Customer</Button> : undefined} />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl !min-w-[820px]">
              <thead><tr><th>Name</th><th>Phone</th><th>Total Purchases</th><th>Outstanding</th><th>Last Purchase</th><th className="!text-right">Actions</th></tr></thead>
              <tbody>
                {rows.map(({ c, stats }) => (
                  <tr key={c.id} className="cursor-pointer" onClick={() => setDetail(c)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <p className="font-bold text-ink">{c.name}</p>
                          <p className="text-[11px] text-faint">{c.city} · {c.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-[13px] text-sub">{c.phone}</td>
                    <td className="font-bold text-ink tnum">{ghs(stats.totalPurchases)}</td>
                    <td>{stats.outstanding > 0 ? <span className="font-bold text-danger tnum">{ghs(stats.outstanding)}</span> : <span className="text-faint">—</span>}</td>
                    <td className="text-sub">{stats.lastPurchase ? fmtDay(stats.lastPurchase) : "—"}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setDetail(c)} aria-label={`View ${c.name}`} className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Eye className="size-4" /></button>
                      <button onClick={() => openForm(c)} aria-label={`Edit ${c.name}`} className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Pencil className="size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* add/edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit customer" : "Add customer"}
        sub={editing ? undefined : "They'll appear in the POS customer selector"}
        footer={<><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Save Changes" : "Add Customer"}</Button></>}>
        <div className="space-y-4">
          <Field label="Full name" error={errors.name}>
            <Input value={form.name} invalid={!!errors.name} placeholder="Ama Mensah" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" error={errors.phone}>
              <Input value={form.phone} invalid={!!errors.phone} placeholder="024 417 8823" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} inputMode="tel" />
            </Field>
            <Field label="City / Town" error={errors.city}>
              <Input value={form.city} invalid={!!errors.city} placeholder="Osu" onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <Select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
                {GH_REGIONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Email (optional)">
              <Input type="email" value={form.email} placeholder="ama@gmail.com" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>

      {/* detail drawer */}
      {detail && <CustomerDrawer customer={detail} onClose={() => setDetail(null)} onReceipt={(s) => setReceipt(s)} />}
      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function CustomerDrawer({ customer, onClose, onReceipt }: {
  customer: Customer; onClose: () => void; onReceipt: (s: Sale) => void;
}) {
  const { data } = useApp();
  const stats = getCustomerStats(data, customer.id);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy2/60 animate-fade-in" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 w-full sm:w-[440px] bg-paper border-l border-line shadow-pop overflow-y-auto animate-fade-in" role="dialog" aria-label={`Customer ${customer.name}`}>
        <div className="sticky top-0 bg-navy text-white px-6 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={customer.name} size="lg" />
            <div className="min-w-0">
              <h2 className="font-display font-extrabold text-xl truncate">{customer.name}</h2>
              <p className="text-white/60 text-sm">{customer.city} · {customer.region}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="ml-auto p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <DrawerStat l="Purchases" v={ghs(stats.totalPurchases)} />
            <DrawerStat l="Visits" v={String(stats.sales.length)} />
            <DrawerStat l="Owes you" v={stats.outstanding > 0 ? ghs(stats.outstanding) : "—"} warn={stats.outstanding > 0} />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-faint mb-2.5">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2.5 text-ink font-semibold"><Phone className="size-4 text-brand" /> {customer.phone}</li>
              <li className="flex items-center gap-2.5 text-sub"><MapPin className="size-4 text-brand" /> {customer.city}, {customer.region} Region</li>
              <li className="flex items-center gap-2.5 text-sub"><CalendarDays className="size-4 text-brand" /> Customer since {fmtDate(customer.createdAt)}</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-faint mb-2.5">
              Purchase history {stats.outstanding > 0 && <Badge tone="danger" className="ml-1">{ghs(stats.outstanding)} outstanding</Badge>}
            </h3>
            {stats.sales.length === 0 ? (
              <p className="text-sm text-sub">No purchases yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.sales.map((s) => {
                  const st = debtStatus(s);
                  return (
                    <li key={s.id}>
                      <button onClick={() => onReceipt(s)} className="w-full text-left rounded-lg border border-line bg-card px-4 py-3 hover:border-brand/50 hover:shadow-card transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[13px] font-bold text-brand">#{s.receipt}</span>
                          <span className="font-extrabold tnum text-ink">{ghs(s.total)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-sub truncate">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                          <span className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-faint">{fmtDay(s.date)}</span>
                            <Badge tone={statusTone(st)}>{st === "Paid" ? "Paid" : st}</Badge>
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function DrawerStat({ l, v, warn }: { l: string; v: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-white/8 border border-white/10 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{l}</p>
      <p className={`font-extrabold text-[15px] tnum mt-0.5 ${warn ? "text-gold" : "text-white"}`}>{v}</p>
    </div>
  );
}
