import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, LockKeyhole, LogOut, Package, Receipt, Users } from "lucide-react";
import { Button, Card, Input, StatCard } from "../components/ui";
import { useApp } from "../state/store";
import { verifyCeoPin } from "../services/ceoService";
import { ghs } from "../lib/format";

export default function CeoDashboard() {
  const { data, toast } = useApp();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const sales = data.sales.filter((sale) => +new Date(sale.date) >= +monthStart && !sale.voidedAt);
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + (item.price - item.cost) * item.qty, 0), 0);

  if (!unlocked) {
    const unlock = async () => {
      if (!/^\d{4}$/.test(pin)) { toast("Enter your 4-digit CEO PIN.", "error"); return; }
      try {
        if (!(await verifyCeoPin(pin))) { toast("Incorrect CEO PIN.", "error"); return; }
        setUnlocked(true); setPin("");
      } catch (error) {
        toast(error instanceof Error ? error.message : "Unable to verify CEO PIN.", "error");
      }
    };
    return <div className="min-h-[70vh] grid place-items-center"><Card className="w-full max-w-sm p-6 text-center"><LockKeyhole className="size-8 mx-auto text-brand" /><h1 className="font-display text-xl font-bold mt-3">CEO Dashboard</h1><p className="text-sm text-sub mt-2">Enter your business PIN to continue.</p><Input className="mt-5 text-center tracking-[0.5em]" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} type="password" placeholder="••••" /><Button className="w-full mt-4" onClick={unlock}>Unlock dashboard</Button></Card></div>;
  }

  return <div className="space-y-6"><div className="flex items-center justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">CEO Dashboard</h1><p className="text-sm text-sub mt-1">{data.settings.name} · business performance overview</p></div><Button variant="secondary" size="sm" onClick={() => setUnlocked(false)}><LogOut className="size-4" /> Lock</Button></div><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard label="Revenue this month" value={revenue} icon={<Receipt className="size-4" />} tone="brand" /><StatCard label="Gross profit" value={profit} icon={<BarChart3 className="size-4" />} tone="ok" /><StatCard label="Sales" value={sales.length} prefix="" icon={<Receipt className="size-4" />} tone="gold" /><StatCard label="Products" value={data.products.length} prefix="" icon={<Package className="size-4" />} tone="brand" /></div><Card className="p-5"><h2 className="font-display font-bold">Business snapshot</h2><div className="grid sm:grid-cols-3 gap-4 mt-4"><div><p className="text-xs text-sub">Customers</p><p className="text-2xl font-bold">{data.customers.length}</p></div><div><p className="text-xs text-sub">Team members</p><p className="text-2xl font-bold">{data.staff.length}</p></div><div><p className="text-xs text-sub">Stock value</p><p className="text-2xl font-bold">{ghs(data.products.reduce((sum, product) => sum + product.stock * product.cost, 0))}</p></div></div></Card><Link to="/settings" state={{ tab: "business" }} className="text-sm text-brand font-semibold">Manage business settings →</Link></div>;
}
