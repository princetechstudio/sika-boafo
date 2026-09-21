/** Receipt history + professional receipt preview with print/share. */
import React, { useMemo, useState } from "react";
import { Download, Eye, Printer, Receipt as ReceiptIcon, SearchX, Share2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SearchBox, Select, statusTone } from "../components/ui";
import { useApp } from "../state/store";
import type { Sale } from "../data/mockData";
import { debtStatus, saleOutstanding, salePaid } from "../services/dataService";
import { fmtDate, fmtTime, ghs, METHOD_META } from "../lib/format";

export default function Receipts() {
  const { data } = useApp();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("All");
  const [open, setOpen] = useState<Sale | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.sales.filter((s) =>
      (method === "All" || s.method === method) &&
      (!q || s.receipt.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q))
    );
  }, [data.sales, query, method]);

  return (
    <div className="space-y-5">
      <PageHeader title="Receipts" sub={`${data.sales.length} receipts issued · every sale, saved forever`} />
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line">
          <SearchBox value={query} onChange={setQuery} placeholder="Search receipt # or customer…" className="flex-1" />
          <Select value={method} onChange={(e) => setMethod(e.target.value)} className="sm:w-52">
            <option value="All">All payment methods</option>
            {Object.keys(METHOD_META).filter((m) => m !== "Credit").map((m) => <option key={m}>{m}</option>)}
            <option>Credit</option>
          </Select>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<SearchX className="size-6" />} title="No receipts found"
            desc={query || method !== "All" ? "Try a different search or filter." : "No sales recorded yet — receipts appear here after your first sale."} />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl !min-w-[760px]">
              <thead><tr><th>Receipt Number</th><th>Customer</th><th>Amount</th><th>Payment Method</th><th>Date</th><th>Status</th><th className="!text-right">View</th></tr></thead>
              <tbody>
                {rows.map((s) => {
                  const st = debtStatus(s);
                  return (
                    <tr key={s.id} className="cursor-pointer" onClick={() => setOpen(s)}>
                      <td className="font-mono font-semibold text-brand">#{s.receipt}</td>
                      <td className="font-semibold text-ink">{s.customerName}</td>
                      <td className="font-bold text-ink tnum">{ghs(s.total)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub">
                          <span className="size-2 rounded-full" style={{ background: METHOD_META[s.method]?.dot }} />
                          {METHOD_META[s.method]?.short ?? s.method}
                        </span>
                      </td>
                      <td className="text-sub">{fmtDate(s.date)} · {fmtTime(s.date)}</td>
                      <td><Badge tone={statusTone(st)}>{st === "Paid" ? "Paid" : st === "Partially Paid" ? "Partially Paid" : st}</Badge></td>
                      <td className="text-right">
                        <button onClick={(e) => { e.stopPropagation(); setOpen(s); }} aria-label={`View receipt ${s.receipt}`}
                          className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Eye className="size-4" /></button>
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
    </div>
  );
}

/* --------------------------- reusable receipt modal ------------------------ */

export function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const { data, toast } = useApp();
  const paid = salePaid(sale);
  const balance = saleOutstanding(sale);
  const biz = data.settings;

  const share = async () => {
    const text =
      `*${biz.name}*\nReceipt #${sale.receipt}\n${fmtDate(sale.date)} ${fmtTime(sale.date)}\n\n` +
      sale.items.map((i) => `${i.qty}× ${i.name} — ${ghs(i.price * i.qty)}`).join("\n") +
      `\n\nTotal: ${ghs(sale.total)}\nPaid: ${ghs(paid)}${balance > 0 ? `\nBalance: ${ghs(balance)}` : ""}\n\nMedaase! Thank you for your business.`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Receipt copied — paste it in WhatsApp to share.", "info");
    } catch {
      toast("Couldn't copy on this browser.", "error");
    }
  };

  return (
    <Modal open onClose={onClose} title={`Receipt #${sale.receipt}`} sub={`${fmtDate(sale.date)} at ${fmtTime(sale.date)}`} wide id="print-area"
      footer={
        <>
          <Button variant="secondary" onClick={share}><Share2 className="size-4" /> Share</Button>
          <Button variant="secondary" onClick={() => { toast("Opening print dialog — choose “Save as PDF”.", "info"); setTimeout(() => window.print(), 350); }}>
            <Download className="size-4" /> Download PDF
          </Button>
          <Button onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
        </>
      }>
      <div className="receipt-paper mx-auto max-w-sm rounded-xl border-2 border-dashed border-line2 bg-card2 p-5 font-mono text-[13px] text-ink">
        <div className="text-center">
          <p className="font-display font-extrabold text-lg tracking-tight">Sika Boafo</p>
          <p className="font-bold mt-1">{biz.name}</p>
          <p className="text-sub text-[11px] mt-0.5">{biz.location}</p>
          <p className="text-sub text-[11px]">Tel: {biz.phone}</p>
        </div>
        <div aria-hidden className="kente h-1 rounded-full my-3" />
        <div className="flex justify-between text-[11px] text-sub">
          <span>Receipt: <b className="text-ink">#{sale.receipt}</b></span>
          <span>{fmtDate(sale.date)}</span>
        </div>
        <div className="flex justify-between text-[11px] text-sub">
          <span>Customer: <b className="text-ink">{sale.customerName}</b></span>
          <span>{fmtTime(sale.date)}</span>
        </div>
        <div aria-hidden className="border-t border-dashed border-line2 my-3" />
        <table className="w-full text-[12px]">
          <tbody>
            {sale.items.map((it, i) => (
              <tr key={i}>
                <td className="py-0.5 pr-2">{it.qty}× {it.name}</td>
                <td className="py-0.5 text-right font-semibold tnum whitespace-nowrap">{ghs(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div aria-hidden className="border-t border-dashed border-line2 my-3" />
        <Row l="Subtotal" v={ghs(sale.subtotal)} />
        {sale.discount > 0 && <Row l="Discount" v={`-${ghs(sale.discount)}`} />}
        <div className="flex justify-between items-baseline py-1">
          <span className="font-bold">TOTAL</span>
          <span className="font-extrabold text-lg tnum">{ghs(sale.total)}</span>
        </div>
        <Row l={`Paid (${METHOD_META[sale.method]?.short ?? sale.method})`} v={ghs(paid)} />
        <Row l="Balance" v={balance > 0 ? ghs(balance) : "—"} strong={balance > 0} />
        {sale.dueDate && balance > 0 && <p className="text-[11px] text-warn-deep mt-1">Payment due by {fmtDate(sale.dueDate)}</p>}
        <div aria-hidden className="border-t border-dashed border-line2 my-3" />
        <p className="text-center text-[11px] text-sub">Served by {sale.cashier}</p>
        <p className="text-center font-bold mt-1">Medaase! Thank you for your business.</p>
        <p className="text-center text-[10px] text-faint mt-2">Powered by Sika Boafo</p>
      </div>
    </Modal>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-warn-deep font-bold" : "text-sub"} py-0.5`}>
      <span>{l}</span><span className="tnum">{v}</span>
    </div>
  );
}

export { ReceiptIcon };
