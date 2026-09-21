/** New Sale — the POS. Fast on desktop, thumb-friendly on mobile. */
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote, CalendarClock, CheckCircle2, Minus, Pause, Plus, Printer,
  Receipt, ShoppingCart, Trash2, UserRoundPlus, Wallet, X, Zap,
} from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, Select } from "../components/ui";
import { useApp } from "../state/store";
import type { Product, Sale, SaleItem } from "../data/mockData";
import { productCategoriesForBusinessType, categoryColor } from "../data/mockData";
import { authService } from "../services/authService";
import { cx, fmtDateInput, ghs, METHOD_META, PAYMENT_METHODS, uid } from "../lib/format";
import { ReceiptModal } from "./Receipts";
import { planLimit } from "../lib/plans";

export default function NewSale() {
  const { data, dispatch, toast } = useApp();
  const nav = useNavigate();
  const session = authService.getSession();

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("MTN Mobile Money");
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState(() => fmtDateInput(new Date(Date.now() + 7 * 86_400_000)));
  const [received, setReceived] = useState("");
  const [cartOpen, setCartOpen] = useState(false); // mobile sheet
  const [doneSale, setDoneSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const productCategories = useMemo(() => productCategoriesForBusinessType(data.settings.type), [data.settings.type]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) =>
      (category === "All" || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [data.products, query, category]);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discountVal = Math.min(subtotal, Math.max(0, parseFloat(discount) || 0));
  const total = subtotal - discountVal;
  const receivedVal = parseFloat(received) || 0;
  const change = Math.max(0, receivedVal - total);
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  const customer = data.customers.find((c) => c.id === customerId);

  const inCartQty = (p: Product) => cart.find((c) => c.productId === p.id)?.qty ?? 0;

  const add = (p: Product) => {
    if (p.stock <= inCartQty(p)) { toast(`Only ${p.stock}× ${p.name} in stock.`, "warning"); return; }
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id);
      return existing
        ? c.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { productId: p.id, name: p.name, qty: 1, price: p.price, cost: p.cost }];
    });
  };
  const setQty = (id: string, qty: number) => {
    const p = data.products.find((x) => x.id === id);
    if (p && qty > p.stock) { toast(`Only ${p.stock}× ${p.name} in stock.`, "warning"); qty = p.stock; }
    setCart((c) => (qty <= 0 ? c.filter((i) => i.productId !== id) : c.map((i) => (i.productId === id ? { ...i, qty } : i))));
  };

  const clear = () => { setCart([]); setDiscount(""); setReceived(""); setIsCredit(false); setCustomerId(""); };

  const hold = () => {
    if (!cart.length) return;
    dispatch({
      type: "HELD_SAVE",
      held: { id: uid("h"), label: customer ? `${customer.name.split(" ")[0]}'s order` : `Held ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`, customerId: customerId || null, items: cart, savedAt: new Date().toISOString() },
    });
    toast("Sale held. Pick it up anytime.", "info");
    clear(); setCartOpen(false);
  };

  const complete = () => {
    if (!cart.length) { toast("Cart is empty — add products first.", "warning"); return; }
    if (isCredit && !customerId) { toast("Pick a customer for credit sales.", "warning"); return; }
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    if (data.sales.filter((sale) => +new Date(sale.date) >= +monthStart).length >= planLimit(data.plan, "monthlySales")) {
      toast("Free plan monthly sales limit reached. Upgrade to continue selling.", "warning");
      return;
    }
    setCompleting(true);
    // small delay so the button state feels real
    window.setTimeout(() => {
      const now = new Date().toISOString();
      const receiptNo = data.nextReceiptNo;
      const paidAmount = isCredit ? 0 : total;
      const sale: Sale = {
        id: uid("s"), receipt: `KB-${receiptNo}`, receiptNo,
        customerId: customerId || null,
        customerName: customer?.name ?? "Walk-in Customer",
        items: cart, subtotal, discount: discountVal, total,
        payments: paidAmount > 0 ? [{ id: uid("pay"), amount: paidAmount, method, date: now }] : [],
        method: isCredit ? "Credit" : method,
        date: now,
        dueDate: isCredit ? new Date(dueDate + "T18:00:00").toISOString() : null,
        cashier: session?.user.name ?? "Prince Ankomah",
      };
      dispatch({ type: "SALE_COMPLETE", input: { items: cart, customerId: customerId || null, customerName: sale.customerName, discount: discountVal, method: sale.method, amountPaid: paidAmount, dueDate: sale.dueDate, cashier: sale.cashier }, sale });
      toast("Sale completed successfully.");
      setDoneSale(sale);
      setCompleting(false);
      setCartOpen(false);
      clear();
    }, 650);
  };

  const resumeHeld = (id: string) => {
    const h = data.heldSales.find((x) => x.id === id);
    if (!h) return;
    setCart(h.items);
    setCustomerId(h.customerId ?? "");
    dispatch({ type: "HELD_REMOVE", id });
    toast("Held sale resumed.", "info");
  };

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-5 items-start">
      {/* ------------------------------ products ------------------------------ */}
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Scan or search products…" aria-label="Search products"
              className="inp pl-10" style={{ backgroundImage: "none" }} />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          {data.heldSales.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {data.heldSales.map((h) => (
                <button key={h.id} onClick={() => resumeHeld(h.id)}
                  className="chip shrink-0 !border-gold/50 !bg-gold-soft !text-gold-deep hover:!border-gold">
                  <Pause className="size-3.5" /> {h.label} · {ghs(h.items.reduce((s, i) => s + i.price * i.qty, 0))}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          {["All", ...productCategories].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={cx("chip shrink-0", category === c && "chip-on")}>{c}</button>
          ))}
        </div>

        {products.length === 0 ? (
          <Card><div className="py-10 text-center">
            <p className="font-display font-bold text-ink">No products match “{query}”</p>
            <p className="text-sm text-sub mt-1">Try another name or category.</p>
          </div></Card>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => {
              const left = p.stock - inCartQty(p);
              const out = p.stock <= 0;
              const maxed = left <= 0 && !out;
              return (
                <button key={p.id} onClick={() => add(p)} disabled={out}
                  className={cx(
                    "group relative text-left rounded-xl border bg-card p-3.5 transition-all duration-150",
                    out ? "opacity-50 cursor-not-allowed border-line"
                      : "border-line hover:border-brand/60 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0"
                  )}>
                  <span className="grid place-items-center h-16 rounded-lg text-white font-display font-extrabold text-2xl mb-3 transition-transform group-hover:scale-[1.03]"
                    style={{ background: `linear-gradient(135deg, ${categoryColor(p.category)}, ${categoryColor(p.category)}cc)` }}>
                    {p.name[0]}
                  </span>
                  <p className="font-bold text-[13px] text-ink leading-snug line-clamp-2 min-h-[34px]">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-brand tnum text-[15px]">{ghs(p.price)}</span>
                    <Badge tone={out ? "danger" : p.stock <= p.minStock ? "warn" : "ok"}>{out ? "Out" : `${left} left`}</Badge>
                  </div>
                  {maxed && <span className="absolute inset-0 grid place-items-center rounded-xl bg-card/70 text-xs font-bold text-warn-deep">All stock in cart</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* -------------------------------- cart -------------------------------- */}
      <CartPanel
        cart={cart} setQty={setQty} customers={data.customers} customerId={customerId}
        setCustomerId={setCustomerId} discount={discount} setDiscount={setDiscount}
        method={method} setMethod={setMethod} isCredit={isCredit} setIsCredit={setIsCredit}
        dueDate={dueDate} setDueDate={setDueDate} received={received} setReceived={setReceived}
        subtotal={subtotal} discountVal={discountVal} total={total} change={change}
        itemCount={itemCount} clear={clear} hold={hold} complete={complete}
        completing={completing} className="hidden lg:block sticky top-20"
      />

      {/* mobile: floating summary + sheet */}
      <div className="lg:hidden fixed bottom-[76px] inset-x-3 z-40">
        {cart.length > 0 && !cartOpen && (
          <button onClick={() => setCartOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl bg-navy text-white px-4 py-3.5 shadow-pop animate-fade-up">
            <span className="grid place-items-center size-8 rounded-lg bg-gold text-navy font-extrabold text-sm tnum">{itemCount}</span>
            <span className="font-bold text-sm">View cart</span>
            <span className="ml-auto font-extrabold tnum">{ghs(total)}</span>
          </button>
        )}
      </div>
      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy2/60 animate-fade-in" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-paper p-3 pb-6 animate-slide-up">
            <div className="mx-auto w-10 h-1 rounded-full bg-line2 mb-3" />
            <CartPanel
              cart={cart} setQty={setQty} customers={data.customers} customerId={customerId}
              setCustomerId={setCustomerId} discount={discount} setDiscount={setDiscount}
              method={method} setMethod={setMethod} isCredit={isCredit} setIsCredit={setIsCredit}
              dueDate={dueDate} setDueDate={setDueDate} received={received} setReceived={setReceived}
              subtotal={subtotal} discountVal={discountVal} total={total} change={change}
              itemCount={itemCount} clear={clear} hold={hold} complete={complete}
              completing={completing} onClose={() => setCartOpen(false)} className="min-h-0 max-h-none flex-1"
            />
          </div>
        </div>
      )}

      {/* success modal */}
      <Modal open={!!doneSale} onClose={() => setDoneSale(null)} title="Sale completed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDoneSale(null)}>New Sale</Button>
            <Button onClick={() => setReceiptOpen(true)}><Printer className="size-4" /> View Receipt</Button>
          </>
        }>
        {doneSale && (
          <div className="text-center py-2">
            <span className="inline-grid place-items-center size-16 rounded-full bg-ok-soft text-ok animate-pop"><CheckCircle2 className="size-9" /></span>
            <h3 className="font-display font-extrabold text-2xl text-ink mt-4">Sale completed successfully.</h3>
            <p className="text-sub text-sm mt-1.5">
              Receipt <b className="font-mono text-brand">#{doneSale.receipt}</b> · {ghs(doneSale.total)}
              {doneSale.method === "Credit" && <span className="text-warn-deep font-semibold"> · added to debtor book</span>}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-left">
              <MiniStat l="Amount" v={ghs(doneSale.total)} />
              <MiniStat l={doneSale.method === "Credit" ? "Due" : "Payment"} v={doneSale.method === "Credit" ? (doneSale.dueDate ? fmtDateInput(new Date(doneSale.dueDate)) : "—") : METHOD_META[doneSale.method]?.short ?? doneSale.method} />
            </div>
          </div>
        )}
      </Modal>
      {doneSale && receiptOpen && <ReceiptModal sale={doneSale} onClose={() => setReceiptOpen(false)} />}
    </div>
  );
}

function MiniStat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg border border-line bg-card2 px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{l}</p>
      <p className="font-bold text-ink text-sm mt-0.5">{v}</p>
    </div>
  );
}

/* ------------------------------- cart panel -------------------------------- */

function CartPanel(props: {
  cart: SaleItem[]; setQty: (id: string, qty: number) => void;
  customers: Array<{ id: string; name: string; phone: string }>;
  customerId: string; setCustomerId: (v: string) => void;
  discount: string; setDiscount: (v: string) => void;
  method: string; setMethod: (v: string) => void;
  isCredit: boolean; setIsCredit: (v: boolean) => void;
  dueDate: string; setDueDate: (v: string) => void;
  received: string; setReceived: (v: string) => void;
  subtotal: number; discountVal: number; total: number; change: number; itemCount: number;
  clear: () => void; hold: () => void; complete: () => void; completing: boolean;
  className?: string; onClose?: () => void;
}) {
  const {
    cart, setQty, customers, customerId, setCustomerId, discount, setDiscount,
    method, setMethod, isCredit, setIsCredit, dueDate, setDueDate, received, setReceived,
    subtotal, discountVal, total, change, itemCount, clear, hold, complete, completing, className, onClose,
  } = props;

  return (
    <Card className={cx("min-h-0 overflow-hidden flex flex-col max-h-[calc(100dvh-110px)]", className)}>
      <div className="flex items-center gap-2.5 px-4 h-13 py-3.5 border-b border-line bg-navy text-white rounded-t-xl">
        <ShoppingCart className="size-4 text-gold" />
        <p className="font-display font-bold text-[15px]">Current Cart</p>
        <Badge tone="gold" className="tnum">{itemCount} item{itemCount === 1 ? "" : "s"}</Badge>
        {onClose && (
          <button onClick={onClose} aria-label="Close cart" className="ml-auto p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="size-4" /></button>
        )}
      </div>

      {/* items */}
      <div className="min-h-[80px] min-w-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 py-3 space-y-2.5">
        {cart.length === 0 && (
          <div className="text-center py-8">
            <Wallet className="size-7 text-faint mx-auto" />
            <p className="text-sm font-bold text-ink mt-2">Cart is empty</p>
            <p className="text-xs text-sub mt-0.5">Tap products to add them.</p>
          </div>
        )}
        {cart.map((it) => (
          <div key={it.productId} className="flex items-center gap-2.5 rounded-lg border border-line bg-card2 px-3 py-2.5 animate-fade-in">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink truncate">{it.name}</p>
              <p className="text-[11px] text-sub tnum">{ghs(it.price)} each</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(it.productId, it.qty - 1)} aria-label={`Decrease ${it.name}`}
                className="size-7 grid place-items-center rounded-md border border-line bg-card text-sub hover:text-ink hover:border-line2 transition"><Minus className="size-3.5" /></button>
              <span className="w-7 text-center font-extrabold text-sm tnum">{it.qty}</span>
              <button onClick={() => setQty(it.productId, it.qty + 1)} aria-label={`Increase ${it.name}`}
                className="size-7 grid place-items-center rounded-md border border-line bg-card text-sub hover:text-ink hover:border-line2 transition"><Plus className="size-3.5" /></button>
            </div>
            <span className="w-16 text-right font-extrabold text-[13px] tnum">{ghs(it.price * it.qty)}</span>
            <button onClick={() => setQty(it.productId, 0)} aria-label={`Remove ${it.name}`}
              className="p-1 rounded text-faint hover:text-danger transition"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
      </div>

      {/* meta */}
      <div className="px-4 pb-4 space-y-3 border-t border-line pt-3.5 bg-card">
        <div className="flex gap-2">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} aria-label="Customer">
            <option value="">Walk-in Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </Select>
          <button onClick={() => { window.location.hash = "#/customers?new=1"; }} aria-label="Add customer"
            className="shrink-0 grid place-items-center size-10 rounded-lg border border-line text-sub hover:text-brand hover:border-brand/50 transition">
            <UserRoundPlus className="size-4" />
          </button>
        </div>

        <div>
          <p className="lbl !mb-1.5">Payment method</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <button key={m} onClick={() => { setMethod(m); setIsCredit(false); }}
                className={cx("flex items-center justify-center gap-1.5 rounded-lg border px-1.5 py-2 text-[11px] font-bold transition",
                  !isCredit && method === m ? "border-brand bg-brand-soft text-brand-deep" : "border-line text-sub hover:border-line2")}>
                <span className="size-2 rounded-full shrink-0" style={{ background: METHOD_META[m]?.dot }} />
                {METHOD_META[m]?.short ?? m}
              </button>
            ))}
          </div>
          <button onClick={() => setIsCredit(!isCredit)}
            className={cx("mt-1.5 w-full flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-bold transition",
              isCredit ? "border-warn bg-warn-soft text-warn-deep" : "border-dashed border-line2 text-sub hover:border-warn/60")}>
            <CalendarClock className="size-3.5" /> {isCredit ? "Credit sale — customer pays later" : "Sell on credit (customer pays later)"}
          </button>
        </div>

        {isCredit ? (
          <Field label="Due date" hint="Adds this customer to your debtor book.">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        ) : method === "Cash" ? (
          <Field label="Cash received (GH₵)" hint={change > 0 ? `Give change: ${ghs(change)}` : "Amount handed over by the customer"}>
            <Input type="number" min="0" value={received} placeholder={String(total)} onChange={(e) => setReceived(e.target.value)} />
          </Field>
        ) : null}

        <div className="flex items-center gap-2">
          <label className="lbl !mb-0 shrink-0" htmlFor="pos-discount">Discount GH₵</label>
          <Input id="pos-discount" type="number" min="0" value={discount} placeholder="0" onChange={(e) => setDiscount(e.target.value)} className="!py-1.5" />
        </div>

        {/* totals */}
        <div className="rounded-lg bg-card2 border border-line px-3.5 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-sub"><span>Subtotal</span><span className="tnum font-semibold">{ghs(subtotal)}</span></div>
          <div className="flex justify-between text-sub"><span>Discount</span><span className="tnum font-semibold text-danger">−{ghs(discountVal)}</span></div>
          <div className="flex justify-between items-baseline pt-1.5 border-t border-line">
            <span className="font-bold text-ink">Total</span>
            <span className="font-display font-extrabold text-[22px] text-brand tnum">{ghs(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <Button variant="secondary" onClick={hold} disabled={!cart.length}><Pause className="size-4" /> Hold</Button>
          <Button variant="ghost" className="!text-danger hover:!bg-danger-soft" onClick={clear} disabled={!cart.length}>Clear Cart</Button>
        </div>
        <Button size="lg" className="w-full" onClick={complete} loading={completing} disabled={!cart.length}>
          <Banknote className="size-4" /> Complete Sale · {ghs(total)}
        </Button>
      </div>
    </Card>
  );
}
