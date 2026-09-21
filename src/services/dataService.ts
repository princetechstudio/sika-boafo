/**
 * dataService — pure selectors and derivations over business data.
 * UI components never compute aggregates inline; they call these so the
 * logic can later move server-side without touching the views.
 */
import type { BusinessData, Customer, Product, Sale } from "../data/mockData";
import { isSameDay } from "../lib/format";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export const stockStatus = (p: Product): StockStatus =>
  p.stock <= 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock";

export const salePaid = (s: Sale) => s.payments.reduce((sum, p) => sum + p.amount, 0);
export const saleOutstanding = (s: Sale) => Math.max(0, s.total - salePaid(s));

export type DebtStatus = "Paid" | "Pending" | "Partially Paid" | "Overdue";
export const debtStatus = (s: Sale): DebtStatus => {
  const out = saleOutstanding(s);
  if (out <= 0) return "Paid";
  if (s.dueDate && new Date(s.dueDate).getTime() < Date.now()) return "Overdue";
  if (salePaid(s) > 0) return "Partially Paid";
  return "Pending";
};

export interface DebtorRow {
  customer: Customer;
  sales: Sale[];
  totalPurchase: number;
  amountPaid: number;
  outstanding: number;
  oldestDue: string | null;
  status: DebtStatus;
}

export const getDebtors = (data: BusinessData): DebtorRow[] => {
  const credit = data.sales.filter((s) => s.customerId && saleOutstanding(s) > 0);
  const byCustomer = new Map<string, Sale[]>();
  credit.forEach((s) => byCustomer.set(s.customerId!, [...(byCustomer.get(s.customerId!) ?? []), s]));
  const rows: DebtorRow[] = [];
  byCustomer.forEach((sales, cid) => {
    const customer = data.customers.find((c) => c.id === cid);
    if (!customer) return;
    const all = data.sales.filter((s) => s.customerId === cid);
    const totalPurchase = all.reduce((sum, s) => sum + s.total, 0);
    const amountPaid = sales.reduce((sum, s) => sum + salePaid(s), 0);
    const outstanding = sales.reduce((sum, s) => sum + saleOutstanding(s), 0);
    const dues = sales.map((s) => s.dueDate).filter(Boolean).sort() as string[];
    const overdue = sales.some((s) => debtStatus(s) === "Overdue");
    const partial = sales.some((s) => salePaid(s) > 0 && saleOutstanding(s) > 0);
    rows.push({
      customer, sales, totalPurchase, amountPaid, outstanding,
      oldestDue: dues[0] ?? null,
      status: overdue ? "Overdue" : partial ? "Partially Paid" : "Pending",
    });
  });
  return rows.sort((a, b) => b.outstanding - a.outstanding);
};

export const getCustomerStats = (data: BusinessData, customerId: string) => {
  const sales = data.sales.filter((s) => s.customerId === customerId);
  return {
    sales,
    totalPurchases: sales.reduce((sum, s) => sum + s.total, 0),
    outstanding: sales.reduce((sum, s) => sum + saleOutstanding(s), 0),
    lastPurchase: sales.length ? sales.reduce((a, b) => (a.date > b.date ? a : b)).date : null,
  };
};

export const getLowStock = (products: Product[]) =>
  products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock / Math.max(1, a.minStock) - b.stock / Math.max(1, b.minStock));

export const inventoryStats = (products: Product[]) => ({
  totalProducts: products.length,
  totalUnits: products.reduce((s, p) => s + p.stock, 0),
  low: products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length,
  out: products.filter((p) => p.stock <= 0).length,
  stockValue: products.reduce((s, p) => s + p.stock * p.cost, 0),
});

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const activeSales = (data: BusinessData) => data.sales.filter((s) => !s.voidedAt);

/** Daily aggregated series for charts: sales, cogs, expenses, profit. */
export const dailySeries = (data: BusinessData, days: number) => {
  const out: Array<{ day: string; label: string; sales: number; cogs: number; expenses: number; profit: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = startOfDay(new Date(Date.now() - i * 86_400_000));
    const daySales = activeSales(data).filter((s) => isSameDay(new Date(s.date), d));
    const dayExp = data.expenses.filter((e) => isSameDay(new Date(e.date), d));
    const sales = daySales.reduce((sum, s) => sum + s.total, 0);
    const cogs = daySales.reduce((sum, s) => sum + s.items.reduce((a, it) => a + it.cost * it.qty, 0), 0);
    const expenses = dayExp.reduce((sum, e) => sum + e.amount, 0);
    out.push({
      day: d.toISOString(),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      sales, cogs, expenses,
      profit: sales - cogs - expenses,
    });
  }
  return out;
};

export const rangeTotals = (data: BusinessData, from: Date, to: Date) => {
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= from.getTime() && t <= to.getTime();
  };
  const sales = activeSales(data).filter((s) => inRange(s.date));
  const expenses = data.expenses.filter((e) => inRange(e.date));
  const revenue = sales.reduce((sum, s) => sum + s.total, 0);
  const cogs = sales.reduce((sum, s) => sum + s.items.reduce((a, it) => a + it.cost * it.qty, 0), 0);
  const expTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    revenue, cogs, grossProfit: revenue - cogs, expenses: expTotal,
    netProfit: revenue - cogs - expTotal,
    transactions: sales.length,
    avgSale: sales.length ? revenue / sales.length : 0,
    saleRows: sales,
    expenseRows: expenses,
  };
};

export const paymentsThisMonth = (data: BusinessData) => {
  const now = new Date();
  return activeSales(data)
    .flatMap((s) => s.payments)
    .filter((p) => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((sum, p) => sum + p.amount, 0);
};

export const todayTotals = (data: BusinessData) => {
  const from = startOfDay(new Date());
  const to = new Date(from.getTime() + 86_400_000 - 1);
  return rangeTotals(data, from, to);
};

export const methodBreakdown = (data: BusinessData, days = 30) => {
  const cutoff = Date.now() - days * 86_400_000;
  const map = new Map<string, number>();
  activeSales(data)
    .filter((s) => +new Date(s.date) >= cutoff)
    .flatMap((s) => s.payments)
    .forEach((p) => map.set(p.method, (map.get(p.method) ?? 0) + p.amount));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};
