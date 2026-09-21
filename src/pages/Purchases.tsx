/** Purchases (restocking) — list + new purchase modal that tops up stock. */
import React, { useState } from "react";
import { ArrowLeftRight, Plus, Trash2 } from "lucide-react";
import {
  Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, statusTone,
} from "../components/ui";
import { useApp } from "../state/store";
import type { Purchase } from "../data/mockData";
import { fmtDate, ghs, uid } from "../lib/format";

export default function Purchases() {
  const { data, dispatch, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState<Purchase["status"]>("Paid");
  const [lines, setLines] = useState<Array<{ productId: string; qty: string; cost: string }>>([
    { productId: data.products[0]?.id ?? "", qty: "10", cost: String(data.products[0]?.cost ?? "") },
  ]);
  const [err, setErr] = useState("");

  const total = lines.reduce((s, l) => {
    const p = data.products.find((x) => x.id === l.productId);
    const qty = parseInt(l.qty, 10) || 0;
    const cost = parseFloat(l.cost) || p?.cost || 0;
    return s + qty * cost;
  }, 0);

  const save = () => {
    if (supplier.trim().length < 2) { setErr("Enter a supplier name."); return; }
    const items = lines
      .map((l) => {
        const p = data.products.find((x) => x.id === l.productId);
        return p ? { productId: p.id, name: p.name, qty: parseInt(l.qty, 10) || 0, cost: parseFloat(l.cost) || p.cost } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x && x.qty > 0);
    if (!items.length) { setErr("Add at least one product with a quantity."); return; }
    setErr("");
    const ref = `PO-${214 + data.purchases.length}`;
    dispatch({
      type: "PURCHASE_ADD",
      purchase: { id: uid("po"), ref, supplier: supplier.trim(), items, total: items.reduce((s, i) => s + i.qty * i.cost, 0), date: new Date().toISOString(), status },
    });
    toast(`Purchase ${ref} recorded — stock updated.`);
    setOpen(false);
    setSupplier("");
    setLines([{ productId: data.products[0]?.id ?? "", qty: "10", cost: String(data.products[0]?.cost ?? "") }]);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" sub="Restocking orders from your suppliers — stock updates automatically"
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> New Purchase</Button>} />

      <Card className="overflow-hidden">
        {data.purchases.length === 0 ? (
          <EmptyState icon={<ArrowLeftRight className="size-6" />} title="No purchases yet"
            desc="Record a restock order and Sika Boafo will add the items to your inventory." />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl !min-w-[820px]">
              <thead><tr><th>Ref</th><th>Supplier</th><th>Products</th><th>Cost</th><th>Date</th><th>Payment Status</th></tr></thead>
              <tbody>
                {data.purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono font-semibold text-brand">{p.ref}</td>
                    <td className="font-bold text-ink">{p.supplier}</td>
                    <td className="text-sub max-w-[280px]">
                      <span className="line-clamp-1">{p.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                    </td>
                    <td className="font-bold text-ink tnum">{ghs(p.total)}</td>
                    <td className="text-sub whitespace-nowrap">{fmtDate(p.date)}</td>
                    <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} wide title="New purchase" sub="Recording a purchase adds the items straight to stock"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Purchase · {ghs(total)}</Button></>}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Supplier">
              <Input value={supplier} placeholder="Makola Central Traders" onChange={(e) => setSupplier(e.target.value)} />
            </Field>
            <Field label="Payment status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as Purchase["status"])}>
                <option>Paid</option><option>Partial</option><option>Credit</option>
              </Select>
            </Field>
          </div>
          <div>
            <p className="lbl">Products</p>
            <div className="space-y-2">
              {lines.map((l, i) => {
                const p = data.products.find((x) => x.id === l.productId);
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <Select value={l.productId} className="flex-1" aria-label="Product"
                      onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, productId: e.target.value, cost: String(data.products.find((y) => y.id === e.target.value)?.cost ?? x.cost) } : x)))}>
                      {data.products.map((pp) => <option key={pp.id} value={pp.id}>{pp.name}</option>)}
                    </Select>
                    <Input type="number" min="1" value={l.qty} className="!w-20" aria-label="Quantity"
                      onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                    <Input type="number" min="0" value={l.cost} className="!w-24" aria-label="Unit cost" placeholder="cost"
                      onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, cost: e.target.value } : x)))} />
                    <button onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} disabled={lines.length === 1}
                      aria-label="Remove line" className="p-2 rounded-lg text-sub hover:text-danger hover:bg-danger-soft disabled:opacity-30 transition">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setLines((ls) => [...ls, { productId: data.products[0]?.id ?? "", qty: "10", cost: "" }])}>
              <Plus className="size-3.5" /> Add product line
            </Button>
          </div>
          {err && <p className="text-xs font-medium text-danger">{err}</p>}
          <div className="rounded-lg bg-card2 border border-line px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-sub">Total purchase cost</span>
            <span className="font-extrabold text-lg tnum text-ink">{ghs(total)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
