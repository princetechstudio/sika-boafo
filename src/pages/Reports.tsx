/** Reports — Sales / Expenses / Profit / Inventory / Debtors with CSV export. */
import React, { useMemo, useState } from "react";
import { Download, TrendingDown, TrendingUp, Wallet, Receipt, Boxes, Coins } from "lucide-react";
import { Badge, Button, Card, Input, PageHeader, StatCard, statusTone, Tabs } from "../components/ui";
import { AreaMoney, BarsMoney, CHART, Donut, LineMoney } from "../components/charts";
import { useApp } from "../state/store";
import { dailySeries, getDebtors, inventoryStats, rangeTotals } from "../services/dataService";
import { downloadCSV, fmtDate, ghs, uid } from "../lib/format";
import { hasPaidFeature } from "../lib/plans";

type TabId = "sales" | "expenses" | "profit" | "inventory" | "debtors";
type RangeId = "today" | "7d" | "month" | "lastMonth" | "custom";

const RANGES: Array<{ id: RangeId; label: string }> = [
  { id: "today", label: "Today" }, { id: "7d", label: "7 Days" },
  { id: "month", label: "This Month" }, { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom" },
];

function rangeBounds(id: RangeId, custom: { from: string; to: string }): [Date, Date] {
  const now = new Date();
  const sod = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  switch (id) {
    case "today": return [sod(now), new Date(sod(now).getTime() + 86_399_000)];
    case "7d": return [sod(new Date(now.getTime() - 6 * 86_400_000)), new Date()];
    case "month": return [new Date(now.getFullYear(), now.getMonth(), 1), new Date()];
    case "lastMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return [from, to];
    }
    case "custom": {
      const from = custom.from ? new Date(custom.from + "T00:00:00") : sod(new Date(now.getTime() - 6 * 86_400_000));
      const to = custom.to ? new Date(custom.to + "T23:59:59") : new Date();
      return [from, to];
    }
  }
}

export default function Reports() {
  const { data, toast } = useApp();
  const [tab, setTab] = useState<TabId>("sales");
  const [range, setRange] = useState<RangeId>("month");
  const [custom, setCustom] = useState({ from: "", to: "" });

  const [from, to] = useMemo(() => rangeBounds(range, custom), [range, custom]);
  const totals = useMemo(() => rangeTotals(data, from, to), [data, from, to]);
  const series = useMemo(() => dailySeries(data, 30), [data]);
  const debtors = useMemo(() => getDebtors(data), [data]);
  const inv = useMemo(() => inventoryStats(data.products), [data.products]);

  const chartData = useMemo(() => {
    return series.filter((d) => { const t = new Date(d.day).getTime(); return t >= from.getTime() && t <= to.getTime(); });
  }, [series, from, to]);

  const expByCat = useMemo(() => {
    const map = new Map<string, number>();
    totals.expenseRows.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [totals]);

  const exportCSV = () => {
    if (!hasPaidFeature(data.plan, "csvExport")) {
      toast("CSV export is available on Pro and Business plans.", "warning");
      return;
    }
    if (tab === "sales") {
      downloadCSV(`kasabiz-sales-${uid("")}.csv`,
        ["Receipt", "Date", "Customer", "Items", "Total", "Method", "Status"],
        totals.saleRows.map((s) => [s.receipt, fmtDate(s.date), s.customerName, s.items.map((i) => `${i.qty}x ${i.name}`).join("; "), s.total, s.method, s.total - s.payments.reduce((a, p) => a + p.amount, 0) <= 0 ? "Paid" : "Credit"]));
    } else if (tab === "expenses") {
      downloadCSV(`kasabiz-expenses.csv`, ["Date", "Description", "Category", "Amount", "Method"],
        totals.expenseRows.map((e) => [fmtDate(e.date), e.description, e.category, e.amount, e.method]));
    } else if (tab === "profit") {
      downloadCSV(`kasabiz-profit.csv`, ["Day", "Revenue", "COGS", "Gross Profit", "Expenses", "Net Profit"],
        chartData.map((d) => [d.label, d.sales, d.cogs, d.sales - d.cogs, d.expenses, d.profit]));
    } else if (tab === "inventory") {
      downloadCSV(`kasabiz-inventory.csv`, ["Product", "SKU", "Stock", "Min", "Cost", "Stock Value"],
        data.products.map((p) => [p.name, p.sku, p.stock, p.minStock, p.cost, p.stock * p.cost]));
    } else {
      downloadCSV(`kasabiz-debtors.csv`, ["Customer", "Phone", "Total Purchase", "Paid", "Outstanding", "Status"],
        debtors.map((d) => [d.customer.name, d.customer.phone, d.totalPurchase, d.amountPaid, d.outstanding, d.status]));
    }
    toast("CSV exported — check your downloads.", "info");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" sub="Clear numbers for better decisions"
        actions={<Button variant="secondary" onClick={exportCSV}><Download className="size-4" /> Export CSV</Button>} />

      {/* date filter */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} className={`chip ${range === r.id ? "chip-on" : ""}`}>{r.label}</button>
        ))}
        {range === "custom" && (
          <span className="flex items-center gap-2 animate-fade-in">
            <Input type="date" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} className="!w-auto" aria-label="From date" />
            <span className="text-sub text-sm font-semibold">to</span>
            <Input type="date" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} className="!w-auto" aria-label="To date" />
          </span>
        )}
        <span className="ml-auto text-[13px] font-semibold text-faint hidden sm:block">
          {fmtDate(from.toISOString())} → {fmtDate(to.toISOString())}
        </span>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Revenue" value={totals.revenue} icon={<TrendingUp className="size-4" />} tone="brand" sub={<span>{totals.transactions} sales</span>} />
        <StatCard label="Cost of Goods" value={totals.cogs} icon={<Boxes className="size-4" />} tone="info" sub={<span>what stock cost you</span>} />
        <StatCard label="Gross Profit" value={totals.grossProfit} icon={<Receipt className="size-4" />} tone="gold" sub={<span>revenue − COGS</span>} />
        <StatCard label="Expenses" value={totals.expenses} icon={<Wallet className="size-4" />} tone="warn" sub={<span>running costs</span>} />
        <StatCard label="Net Profit" value={totals.netProfit} icon={totals.netProfit >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          tone={totals.netProfit >= 0 ? "ok" : "danger"} sub={<span className={totals.netProfit >= 0 ? "text-ok" : "text-danger"}>{totals.netProfit >= 0 ? "you made money" : "you lost money"}</span>} />
      </div>

      <Tabs<TabId>
        tabs={[
          { id: "sales", label: "Sales", icon: <TrendingUp className="size-4" /> },
          { id: "expenses", label: "Expenses", icon: <Wallet className="size-4" /> },
          { id: "profit", label: "Profit", icon: <Coins className="size-4" /> },
          { id: "inventory", label: "Inventory", icon: <Boxes className="size-4" /> },
          { id: "debtors", label: "Debtors", icon: <Receipt className="size-4" /> },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "sales" && (
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-in">
          <Card><div className="px-5 pt-4"><h3 className="font-display font-bold text-[15px] text-ink">Daily sales</h3><p className="text-xs text-sub">last 30 days vs selected range</p></div><AreaMoney data={chartData} dataKey="sales" name="Sales" color={CHART.brand} /></Card>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2"><h3 className="font-display font-bold text-[15px] text-ink">Top products in range</h3></div>
            <div className="tbl-wrap">
              <table className="tbl !min-w-[420px]">
                <thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
                <tbody>
                  {topProducts(totals.saleRows).map((t) => (
                    <tr key={t.name}><td className="font-bold text-ink">{t.name}</td><td className="tnum text-sub">{t.units}</td><td className="tnum font-bold text-ink">{ghs(t.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "expenses" && (
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-in">
          <Card><div className="px-5 pt-4"><h3 className="font-display font-bold text-[15px] text-ink">Daily expenses</h3></div><BarsMoney data={chartData} dataKey="expenses" name="Expenses" color={CHART.warn} /></Card>
          <Card>
            <div className="px-5 pt-4 pb-2"><h3 className="font-display font-bold text-[15px] text-ink">By category in range</h3></div>
            <div className="px-5 pb-5">
              {expByCat.length ? <Donut data={expByCat} height={230} innerLabel="spent" /> : <p className="text-sm text-sub py-10 text-center">No expenses in this range.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === "profit" && (
        <div className="grid gap-5 animate-fade-in">
          <Card><div className="px-5 pt-4"><h3 className="font-display font-bold text-[15px] text-ink">Daily net profit</h3><p className="text-xs text-sub">sales − cost of goods − expenses</p></div><LineMoney data={chartData} dataKey="profit" name="Profit" color={CHART.ok} /></Card>
        </div>
      )}

      {tab === "inventory" && (
        <Card className="overflow-hidden animate-fade-in">
          <div className="tbl-wrap">
            <table className="tbl !min-w-[640px]">
              <thead><tr><th>Product</th><th>Stock</th><th>Cost Price</th><th>Stock Value</th><th>Status</th></tr></thead>
              <tbody>
                {data.products.map((p) => {
                  const st = p.stock <= 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock";
                  return (
                    <tr key={p.id}>
                      <td className="font-bold text-ink">{p.name}</td>
                      <td className="tnum text-sub">{p.stock}</td>
                      <td className="tnum text-sub">{ghs(p.cost)}</td>
                      <td className="tnum font-bold text-ink">{ghs(p.stock * p.cost)}</td>
                      <td><Badge tone={statusTone(st)}>{st}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 bg-card2 border-t border-line flex justify-between">
            <span className="text-sm font-bold text-sub">Total stock value (at cost)</span>
            <span className="font-extrabold text-ink tnum">{ghs(inv.stockValue)}</span>
          </div>
        </Card>
      )}

      {tab === "debtors" && (
        <Card className="overflow-hidden animate-fade-in">
          {debtors.length === 0 ? (
            <p className="text-center text-sm font-semibold text-ok py-12">Great! No outstanding debts.</p>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl !min-w-[640px]">
                <thead><tr><th>Customer</th><th>Outstanding</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {debtors.map((d) => (
                    <tr key={d.customer.id}>
                      <td className="font-bold text-ink">{d.customer.name}</td>
                      <td className="tnum font-bold text-danger">{ghs(d.outstanding)}</td>
                      <td className="text-sub">{d.oldestDue ? fmtDate(d.oldestDue) : "—"}</td>
                      <td><Badge tone={statusTone(d.status)}>{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function topProducts(sales: ReturnType<typeof Object.freeze> extends never ? any[] : any[]) {
  const map = new Map<string, { units: number; revenue: number }>();
  sales.forEach((s: any) =>
    s.items.forEach((i: any) => {
      const cur = map.get(i.name) ?? { units: 0, revenue: 0 };
      map.set(i.name, { units: cur.units + i.qty, revenue: cur.revenue + i.qty * i.price });
    })
  );
  return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}
