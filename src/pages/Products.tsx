/** Product management — search, filter, add/edit/delete via store. */
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Boxes, Eye, Pencil, Plus, SearchX, Trash2 } from "lucide-react";
import {
  Badge, Button, Card, ConfirmModal, EmptyState, Field, Input, Modal,
  PageHeader, SearchBox, Select, statusTone,
} from "../components/ui";
import { useApp } from "../state/store";
import type { Product } from "../data/mockData";
import { categoryColor, productCategoriesForBusinessType } from "../data/mockData";
import { stockStatus } from "../services/dataService";
import { cx, ghs } from "../lib/format";
import { planLimit } from "../lib/plans";

const emptyForm = {
  name: "", sku: "", category: "", price: "", cost: "",
  stock: "", minStock: "", supplier: "", unit: "piece",
};
type FormState = typeof emptyForm;

export default function Products() {
  const { data, dispatch, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const productCategories = useMemo(() => productCategoriesForBusinessType(data.settings.type), [data.settings.type]);

  useEffect(() => {
    if (params.get("new") === "1") { openAdd(); params.delete("new"); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) =>
      (category === "All" || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q))
    );
  }, [data.products, query, category]);

  const openAdd = () => {
    if (data.products.length >= planLimit(data.plan, "products")) {
      toast("Free plan limit reached. Upgrade to add more products.", "warning");
      return;
    }
    setEditing(null); setForm({ ...emptyForm, category: productCategories[0] ?? "Other" }); setErrors({}); setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, price: String(p.price), cost: String(p.cost), stock: String(p.stock), minStock: String(p.minStock), supplier: p.supplier, unit: p.unit });
    setErrors({});
    setFormOpen(true);
  };

  const save = () => {
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = "Product name is required.";
    if (!form.sku.trim()) errs.sku = "SKU is required.";
    const price = parseFloat(form.price); const cost = parseFloat(form.cost);
    const stock = parseInt(form.stock, 10); const minStock = parseInt(form.minStock, 10);
    if (isNaN(price) || price <= 0) errs.price = "Enter a selling price above 0.";
    if (isNaN(cost) || cost < 0) errs.cost = "Enter the cost price.";
    else if (!isNaN(price) && cost > price) errs.cost = "Cost is higher than selling price — you'd sell at a loss.";
    if (isNaN(stock) || stock < 0) errs.stock = "Enter stock quantity.";
    if (isNaN(minStock) || minStock < 0) errs.minStock = "Enter minimum stock.";
    if (!form.supplier.trim()) errs.supplier = "Supplier is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const product: Product = {
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name.trim(), sku: form.sku.trim().toUpperCase(), category: form.category,
      price, cost, stock, minStock, supplier: form.supplier.trim(), unit: form.unit,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "PRODUCT_SAVE", product });
    toast(editing ? "Product updated successfully." : "Product added successfully.");
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    dispatch({ type: "PRODUCT_DELETE", id: deleting.id });
    toast(`"${deleting.name}" deleted.`, "info");
  };

  return (
    <div>
      <PageHeader title="Products" sub={`${data.products.length} products · ${data.products.reduce((s, p) => s + p.stock, 0).toLocaleString("en-GH")} units in stock`}
        actions={<Button onClick={openAdd}><Plus className="size-4" /> Add Product</Button>} />

      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line">
          <SearchBox value={query} onChange={setQuery} placeholder="Search products, SKU or supplier…" className="flex-1" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["All", ...productCategories].map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cx("chip shrink-0", category === c && "chip-on")}>{c}</button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState icon={query || category !== "All" ? <SearchX className="size-6" /> : <Boxes className="size-6" />}
            title={query || category !== "All" ? "No products match" : "No products yet."}
            desc={query || category !== "All" ? "Try a different search term or category." : "Add your first product to start tracking inventory."}
            action={!query && category === "All" ? <Button onClick={openAdd}><Plus className="size-4" /> Add your first product</Button> : undefined} />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl !min-w-[860px]">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Stock</th><th>Status</th><th className="!text-right">Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const st = stockStatus(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="size-9 rounded-lg grid place-items-center text-white font-bold text-sm shrink-0" style={{ background: categoryColor(p.category) }}>
                            {p.name[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate">{p.name}</p>
                            <p className="text-[11px] text-faint">per {p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-[12px] text-sub">{p.sku}</td>
                      <td><Badge tone="brand">{p.category}</Badge></td>
                      <td className="font-bold text-ink tnum">{ghs(p.price)}</td>
                      <td className="text-sub tnum">{ghs(p.cost)}</td>
                      <td>
                        <span className={cx("font-bold tnum", st === "Out of Stock" ? "text-danger" : st === "Low Stock" ? "text-warn-deep" : "text-ink")}>{p.stock}</span>
                        <span className="text-faint text-[11px]"> / min {p.minStock}</span>
                      </td>
                      <td><Badge tone={statusTone(st)} dot={st !== "In Stock"}>{st}</Badge></td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setViewing(p)} aria-label={`View ${p.name}`} className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Eye className="size-4" /></button>
                          <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 rounded-lg text-sub hover:text-brand hover:bg-brand-soft transition"><Pencil className="size-4" /></button>
                          <button onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="p-2 rounded-lg text-sub hover:text-danger hover:bg-danger-soft transition"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* form modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} wide
        title={editing ? "Edit product" : "Add product"} sub={editing ? `Updating ${editing.name}` : "New item for your catalogue"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Save Product"}</Button>
          </>
        }>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Product name" error={errors.name} className="sm:col-span-2">
            <Input value={form.name} invalid={!!errors.name} placeholder="Black T-Shirt" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <Input value={form.sku} invalid={!!errors.sku} placeholder="PF-TSH-001" onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              list="product-category-options"
              placeholder="e.g. Accessories"
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <datalist id="product-category-options">
              {productCategories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Selling price (GH₵)" error={errors.price}>
            <Input type="number" min="0" step="0.01" value={form.price} invalid={!!errors.price} placeholder="200" onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </Field>
          <Field label="Cost price (GH₵)" error={errors.cost}>
            <Input type="number" min="0" step="0.01" value={form.cost} invalid={!!errors.cost} placeholder="120" onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
          </Field>
          <Field label="Stock quantity" error={errors.stock}>
            <Input type="number" min="0" value={form.stock} invalid={!!errors.stock} placeholder="20" onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </Field>
          <Field label="Minimum stock" error={errors.minStock}>
            <Input type="number" min="0" value={form.minStock} invalid={!!errors.minStock} placeholder="5" onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))} />
          </Field>
          <Field label="Supplier" error={errors.supplier}>
            <Input value={form.supplier} invalid={!!errors.supplier} placeholder="Makola Central Traders" onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} />
          </Field>
          <Field label="Unit">
            <Select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
              {["piece", "pair", "dozen", "pack", "bottle", "kg", "metre"].map((u) => <option key={u}>{u}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        title="Delete product?" message={`"${deleting?.name}" will be removed from your catalogue. Past sales keep their records.`} />

      {/* view modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ""}
        sub={viewing ? `${viewing.sku} · ${viewing.category}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>
            <Button onClick={() => { if (viewing) { openEdit(viewing); setViewing(null); } }}><Pencil className="size-4" /> Edit Product</Button>
          </>
        }>
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-card2 p-4">
              <span className="size-14 rounded-xl grid place-items-center text-white font-display font-extrabold text-2xl" style={{ background: categoryColor(viewing.category) }}>
                {viewing.name[0]}
              </span>
              <div>
                <Badge tone={statusTone(stockStatus(viewing))} dot={stockStatus(viewing) !== "In Stock"}>{stockStatus(viewing)}</Badge>
                <p className="text-[13px] text-sub mt-1.5">
                  <b className="text-ink tnum">{viewing.stock}</b> in stock · min {viewing.minStock} · per {viewing.unit}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ViewRow l="Selling price" v={ghs(viewing.price)} strong />
              <ViewRow l="Cost price" v={ghs(viewing.cost)} />
              <ViewRow l="Profit per sale" v={ghs(viewing.price - viewing.cost)} strong />
              <ViewRow l="Margin" v={`${Math.round(((viewing.price - viewing.cost) / Math.max(1, viewing.price)) * 100)}%`} />
              <ViewRow l="Supplier" v={viewing.supplier} wide />
              <ViewRow l="Last updated" v={new Date(viewing.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} wide />
            </div>
            {viewing.stock <= viewing.minStock && (
              <p className="rounded-lg bg-warn-soft border border-warn/25 px-3.5 py-2.5 text-[13px] font-semibold text-warn-deep">
                {viewing.stock === 0 ? "Out of stock — record a purchase to restock." : "Running low — consider restocking soon."}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ViewRow({ l, v, strong, wide }: { l: string; v: string; strong?: boolean; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-line bg-card2 px-3.5 py-2.5 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{l}</p>
      <p className={`mt-0.5 text-sm tnum ${strong ? "font-extrabold text-ink" : "font-semibold text-sub"}`}>{v}</p>
    </div>
  );
}
