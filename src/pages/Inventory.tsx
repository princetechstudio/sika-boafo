/** Inventory — stock health, valuation and movement log. */
import React, { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, PackageMinus, PackagePlus, RotateCcw, Undo2 } from "lucide-react";
import {
  Badge, Button, Card, CardHead, EmptyState, Field, Input, Modal, PageHeader,
  SearchBox, Select, StatCard, statusTone, Textarea,
} from "../components/ui";
import { useApp } from "../state/store";
import type { Movement } from "../data/mockData";
import { inventoryStats, stockStatus } from "../services/dataService";
import { cx, fmtDate, fmtTime, ghs, uid } from "../lib/format";

const MOVES: Array<{ id: Movement["type"]; icon: React.ReactNode }> = [
  { id: "Purchase", icon: <ArrowDownToLine className="size-4" /> },
  { id: "Sale", icon: <ArrowUpFromLine className="size-4" /> },
  { id: "Return", icon: <Undo2 className="size-4" /> },
  { id: "Adjustment", icon: <RotateCcw className="size-4" /> },
  { id: "Damage", icon: <PackageMinus className="size-4" /> },
];

export default function Inventory() {
  const { data, dispatch, toast } = useApp();
  const stats = useMemo(() => inventoryStats(data.products), [data.products]);
  const [query, setQuery] = useState("");
  const [moveOpen, setMoveOpen] = useState(false);
  const [move, setMove] = useState({ type: "Purchase" as Movement["type"], productId: data.products[0]?.id ?? "", qty: "1", note: "" });
  const [moveErr, setMoveErr] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .sort((a, b) => a.stock / Math.max(1, a.minStock) - b.stock / Math.max(1, b.minStock));
  }, [data.products, query]);

  const saveMove = () => {
    const product = data.products.find((p) => p.id === move.productId);
    const qty = parseInt(move.qty, 10);
    if (!product) { setMoveErr("Pick a product."); return; }
    if (isNaN(qty) || qty <= 0) { setMoveErr("Quantity must be a positive number."); return; }
    const sign = move.type === "Purchase" || move.type === "Return" ? 1 : -1;
    if (sign < 0 && qty > product.stock) { setMoveErr(`Only ${product.stock} in stock — can't remove ${qty}.`); return; }
    setMoveErr("");
    dispatch({
      type: "MOVEMENT_ADD",
      movement: { id: uid("mv"), date: new Date().toISOString(), type: move.type, productId: product.id, productName: product.name, qty: sign * qty, note: move.note.trim() || `${move.type} recorded` },
    });
    toast(`${move.type} of ${qty}× ${product.name} recorded.`);
    setMoveOpen(false);
    setMove({ type: move.type, productId: data.products[0]?.id ?? "", qty: "1", note: "" });
  };

  const moveIcon = (t: Movement["type"]) => MOVES.find((m) => m.id === t)?.icon;
  const moveTone = (t: Movement["type"]) => (t === "Purchase" || t === "Return" ? "text-ok bg-ok-soft" : t === "Damage" ? "text-danger bg-danger-soft" : "text-warn-deep bg-warn-soft");

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" sub="Stock levels, valuation and every movement in and out"
        actions={<Button onClick={() => setMoveOpen(true)}><PackagePlus className="size-4" /> Record Movement</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Products" value={stats.totalProducts} prefix="" icon={<Boxes className="size-4" />} tone="brand" sub={<span>in catalogue</span>} />
        <StatCard label="Total Stock Units" value={stats.totalUnits} prefix="" icon={<PackagePlus className="size-4" />} tone="info" sub={<span>on the shelf</span>} />
        <StatCard label="Low Stock" value={stats.low} prefix="" icon={<PackageMinus className="size-4" />} tone="warn" sub={<span>at or below minimum</span>} />
        <StatCard label="Out of Stock" value={stats.out} prefix="" icon={<PackageMinus className="size-4" />} tone="danger" sub={<span className="text-sub">value at cost: {ghs(stats.stockValue)}</span>} />
      </div>

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-5">
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-line">
            <SearchBox value={query} onChange={setQuery} placeholder="Search inventory…" />
          </div>
          <div className="tbl-wrap">
            <table className="tbl !min-w-[680px]">
              <thead><tr><th>Product</th><th>Current Stock</th><th>Minimum Stock</th><th>Status</th><th>Last Updated</th></tr></thead>
              <tbody>
                {rows.map((p) => {
                  const st = stockStatus(p);
                  const ratio = Math.min(1, p.stock / Math.max(1, p.minStock));
                  return (
                    <tr key={p.id}>
                      <td>
                        <p className="font-bold text-ink">{p.name}</p>
                        <p className="text-[11px] font-mono text-faint">{p.sku}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className={cx("font-extrabold tnum w-8", st === "Out of Stock" ? "text-danger" : st === "Low Stock" ? "text-warn-deep" : "text-ink")}>{p.stock}</span>
                          <span className="w-20 h-1.5 rounded-full bg-line overflow-hidden">
                            <span className={cx("block h-full rounded-full", st === "Out of Stock" ? "bg-danger" : st === "Low Stock" ? "bg-warn" : "bg-ok")} style={{ width: `${Math.max(4, ratio * 100)}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="text-sub tnum">{p.minStock}</td>
                      <td><Badge tone={statusTone(st)} dot={st !== "In Stock"}>{st}</Badge></td>
                      <td className="text-sub text-[13px]">{fmtDate(p.updatedAt)} · {fmtTime(p.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* movements */}
        <Card>
          <CardHead title="Stock Movements" sub="Purchases, sales, returns, adjustments & damage" />
          <div className="px-5 pb-5 pt-3">
            {data.movements.length === 0 ? (
              <EmptyState title="No movements yet" desc="Record a purchase, return or adjustment to see it here." />
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {data.movements.map((m) => (
                  <li key={m.id} className="flex gap-3 animate-fade-in">
                    <span className={cx("shrink-0 grid place-items-center size-9 rounded-lg", moveTone(m.type))}>{moveIcon(m.type)}</span>
                    <div className="min-w-0 flex-1 border-b border-line pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-bold text-ink truncate">{m.productName}</p>
                        <span className={cx("text-[13px] font-extrabold tnum", m.qty > 0 ? "text-ok" : "text-danger")}>{m.qty > 0 ? "+" : ""}{m.qty}</span>
                      </div>
                      <p className="text-[11px] text-sub truncate">{m.type} · {m.note}</p>
                      <p className="text-[10px] text-faint mt-0.5">{fmtDate(m.date)} · {fmtTime(m.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* movement modal */}
      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Record stock movement" sub="Changes are recorded in your business inventory"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMoveOpen(false)}>Cancel</Button>
            <Button onClick={saveMove}>Save Movement</Button>
          </>
        }>
        <div className="space-y-4">
          <Field label="Movement type">
            <div className="grid grid-cols-5 gap-1.5">
              {MOVES.map((m) => (
                <button key={m.id} type="button" onClick={() => setMove((s) => ({ ...s, type: m.id }))}
                  className={cx("flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 text-[11px] font-bold transition",
                    move.type === m.id ? "border-brand bg-brand-soft text-brand-deep" : "border-line text-sub hover:border-line2")}>
                  {m.icon}{m.id}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Product">
            <Select value={move.productId} onChange={(e) => setMove((s) => ({ ...s, productId: e.target.value }))}>
              {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.stock} in stock</option>)}
            </Select>
          </Field>
          <Field label="Quantity" error={moveErr}>
            <Input type="number" min="1" value={move.qty} invalid={!!moveErr} onChange={(e) => setMove((s) => ({ ...s, qty: e.target.value }))} />
          </Field>
          <Field label="Note (optional)">
            <Textarea value={move.note} placeholder="e.g. Restock from Makola, PO-214" onChange={(e) => setMove((s) => ({ ...s, note: e.target.value }))} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
