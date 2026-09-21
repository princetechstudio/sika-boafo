/** Owner dashboard — today's numbers, charts, quick actions, activity. */
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Boxes, CalendarDays, Coins, Plus, Receipt,
  ShoppingCart, TrendingDown, TrendingUp, UserRoundPlus, Wallet, Zap,
} from "lucide-react";
import { Badge, Button, Card, CardHead, EmptyState, PageHeader, Progress, StatCard, statusTone } from "../components/ui";
import { AreaMoney, BarsMoney, CHART, Donut, LineMoney, Spark } from "../components/charts";
import { useApp } from "../state/store";
import { authService } from "../services/authService";
import { dailySeries, getDebtors, getLowStock, methodBreakdown, todayTotals } from "../services/dataService";
import { cx, fmtDate, fmtDay, fmtShort, ghs, METHOD_META } from "../lib/format";

const RANGES = [{ id: 7, label: "7 days" }, { id: 14, label: "14 days" }, { id: 30, label: "30 days" }] as const;

export default function Dashboard() {
  const { data } = useApp();
  const nav = useNavigate();
  const [range, setRange] = useState<number>(14);
  const session = authService.getSession();
  const firstName = session?.user.name.split(" ")[0] ?? "there";

  const today = useMemo(() => todayTotals(data), [data]);
  const series = useMemo(() => dailySeries(data, range), [data, range]);
  const lowStock = useMemo(() => getLowStock(data.products), [data.products]);
  const debtors = useMemo(() => getDebtors(data), [data]);
  const methods = useMemo(() => methodBreakdown(data, 30), [data]);
  const outstanding = debtors.reduce((s, d) => s + d.outstanding, 0);

  const todaySales = today.revenue;
  const todayExpenses = today.expenses;
  const todayProfit = todaySales - todayExpenses;

  const recent = data.sales.slice(0, 6);
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Akwaaba, ${firstName}!`}
        sub={
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" /> {todayLabel} · here's how {data.settings.name} is doing.
          </span> as unknown as string
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => nav("/reports")}>View Reports</Button>
            <Button onClick={() => nav("/sales/new")}><Zap className="size-4" /> New Sale</Button>
          </>
        }
      />

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Today's Sales" value={todaySales} tone="brand" icon={<ShoppingCart className="size-4" />}
          sub={<span className="text-ok font-semibold flex items-center gap-1"><TrendingUp className="size-3.5" /> {today.transactions} sales</span>}
          spark={<Spark data={series} dataKey="sales" color={CHART.brand} />} />
        <StatCard label="Today's Expenses" value={todayExpenses} tone="warn" icon={<Wallet className="size-4" />}
          sub={<span className="text-danger font-semibold flex items-center gap-1"><TrendingDown className="size-3.5" /> cash out</span>}
          spark={<Spark data={series} dataKey="expenses" color={CHART.warn} />} />
        <StatCard label="Today's Profit" value={todayProfit} tone="ok" icon={<TrendingUp className="size-4" />}
          sub={<span className="text-sub">sales − expenses</span>}
          spark={<Spark data={series} dataKey="profit" color={CHART.ok} />} />
        <StatCard label="Outstanding Debts" value={outstanding} tone="danger" icon={<Coins className="size-4" />}
          sub={<span className="text-sub">{debtors.length} customer{debtors.length === 1 ? "" : "s"} owing</span>} />
        <StatCard label="Low Stock" value={lowStock.length} prefix="" tone="gold" icon={<Boxes className="size-4" />}
          sub={<span className="text-sub">{lowStock.filter((p) => p.stock === 0).length} out of stock</span>} />
      </div>

      {/* quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "New Sale", icon: <Zap className="size-5" />, to: "/sales/new", tone: "bg-brand text-white" },
          { label: "Add Product", icon: <Plus className="size-5" />, to: "/products?new=1", tone: "bg-gold text-navy" },
          { label: "Add Expense", icon: <Wallet className="size-5" />, to: "/expenses?new=1", tone: "bg-warn text-white" },
          { label: "Add Customer", icon: <UserRoundPlus className="size-5" />, to: "/customers?new=1", tone: "bg-ok text-white" },
        ].map((a) => (
          <button key={a.label} onClick={() => nav(a.to)}
            className={cx("flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0", a.tone)}>
            <span className="grid place-items-center size-9 rounded-lg bg-white/15">{a.icon}</span>
            {a.label}
            <ArrowRight className="size-4 ml-auto opacity-60" />
          </button>
        ))}
      </div>

      {/* charts */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <ChartBlock title="Sales Overview" sub={`GH₵${series.reduce((s, d) => s + d.sales, 0).toLocaleString("en-GH")} in period`}
          range={range} setRange={setRange}>
          <AreaMoney data={series} dataKey="sales" name="Sales" color={CHART.brand} />
        </ChartBlock>
        <ChartBlock title="Expenses Overview" sub={`GH₵${series.reduce((s, d) => s + d.expenses, 0).toLocaleString("en-GH")} spent`}
          range={range} setRange={setRange}>
          <BarsMoney data={series} dataKey="expenses" name="Expenses" color={CHART.warn} />
        </ChartBlock>
        <ChartBlock title="Profit Overview" sub={`GH₵${series.reduce((s, d) => s + d.profit, 0).toLocaleString("en-GH")} net`}
          range={range} setRange={setRange}>
          <LineMoney data={series} dataKey="profit" name="Profit" color={CHART.ok} />
        </ChartBlock>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5">
        {/* recent sales */}
        <Card className="overflow-hidden">
          <CardHead title="Recent Sales" sub="Latest receipts across the till"
            action={<Link to="/sales" className="text-[13px] font-bold text-brand hover:text-brand-deep inline-flex items-center gap-1">View all <ArrowRight className="size-3.5" /></Link>} />
          {recent.length === 0 ? (
            <EmptyState icon={<Receipt className="size-6" />} title="No sales recorded yet."
              desc="Your completed sales will appear here."
              action={<Button onClick={() => nav("/sales/new")}><Zap className="size-4" /> Record first sale</Button>} />
          ) : (
            <div className="tbl-wrap mt-3">
              <table className="tbl">
                <thead><tr><th>Receipt</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id} className="cursor-pointer" onClick={() => nav("/receipts")}>
                      <td className="font-mono text-[13px] font-semibold text-brand">#{s.receipt}</td>
                      <td className="font-semibold text-ink">{s.customerName}</td>
                      <td className="text-sub max-w-[160px] truncate">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                      <td className="font-bold text-ink tnum">{ghs(s.total)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub">
                          <span className="size-2 rounded-full" style={{ background: METHOD_META[s.method]?.dot }} />
                          {METHOD_META[s.method]?.short ?? s.method}
                        </span>
                      </td>
                      <td className="text-sub">{fmtDay(s.date)}</td>
                      <td><Badge tone={statusTone(s.total - s.payments.reduce((a, p) => a + p.amount, 0) <= 0 ? "Paid" : "Pending")}>{s.total - s.payments.reduce((a, p) => a + p.amount, 0) <= 0 ? "Paid" : "Credit"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4 sm:space-y-5">
          {/* low stock */}
          <Card>
            <CardHead title="Low Stock" sub="Items at or below minimum"
              action={<Link to="/inventory" className="text-[13px] font-bold text-brand hover:text-brand-deep inline-flex items-center gap-1">View Inventory <ArrowRight className="size-3.5" /></Link>} />
            <div className="px-5 pb-5 pt-3 space-y-3.5">
              {lowStock.length === 0 && (
                <EmptyState icon={<Boxes className="size-6" />} title="All stocked up" desc="No products are running low. Nice work." />
              )}
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[13px] font-bold text-ink truncate">{p.name}</p>
                    <span className={cx("text-[11px] font-bold tnum", p.stock === 0 ? "text-danger" : "text-warn-deep")}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} remaining`}
                    </span>
                  </div>
                  <Progress value={(p.stock / Math.max(1, p.minStock)) * 100} tone={p.stock === 0 ? "danger" : "warn"} />
                </div>
              ))}
            </div>
          </Card>

          {/* payment methods */}
          <Card>
            <CardHead title="Payment Methods" sub="Last 30 days" />
            <div className="px-5 pb-4 pt-2">
              <Donut data={methods} height={170} innerLabel="collected" />
            </div>
            <div className="px-5 pb-5 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {methods.slice(0, 6).map((m, i) => (
                <span key={m.name} className="flex items-center gap-2 text-xs font-semibold text-sub">
                  <span className="size-2.5 rounded-sm" style={{ background: CHART.pie[i % CHART.pie.length] }} />
                  {METHOD_META[m.name]?.short ?? m.name}
                </span>
              ))}
            </div>
          </Card>

          {/* top debtors */}
          <Card>
            <CardHead title="Debt Watch" sub="Who owes you right now"
              action={<Link to="/debtors" className="text-[13px] font-bold text-brand hover:text-brand-deep inline-flex items-center gap-1">Manage <ArrowRight className="size-3.5" /></Link>} />
            <div className="px-5 pb-5 pt-3 space-y-2.5">
              {debtors.length === 0 && (
                <p className="flex items-center gap-2 text-sm font-semibold text-ok"><AlertTriangle className="size-4" /> Great! No outstanding debts.</p>
              )}
              {debtors.slice(0, 3).map((d) => (
                <div key={d.customer.id} className="flex items-center gap-3 rounded-lg border border-line bg-card2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ink truncate">{d.customer.name}</p>
                    <p className="text-[11px] text-sub">due {d.oldestDue ? fmtShort(d.oldestDue) : "—"}</p>
                  </div>
                  <span className="font-bold text-[13px] text-danger tnum">{ghs(d.outstanding)}</span>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChartBlock({ title, sub, children, range, setRange }: {
  title: string; sub: string; children: React.ReactNode; range: number; setRange: (n: number) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2 px-5 pt-4 pb-1">
        <div>
          <h3 className="font-display font-bold text-[15px] text-ink">{title}</h3>
          <p className="text-xs text-sub mt-0.5 tnum">{sub}</p>
        </div>
        <div className="inline-flex rounded-lg border border-line bg-card2 p-0.5">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={cx("px-2 py-1 rounded-md text-[11px] font-bold transition", range === r.id ? "bg-card text-ink shadow-sm border border-line" : "text-faint hover:text-ink")}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </Card>
  );
}
