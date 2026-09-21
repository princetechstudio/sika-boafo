import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Building2, CreditCard, ShieldCheck, Store, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, KenteBar, StatCard } from "../components/ui";
import { fmtDate } from "../lib/format";
import { useApp } from "../state/store";

export default function Admin() {
  const { data } = useApp();
  const salesThisMonth = data.sales.filter((sale) => !sale.voidedAt && new Date(sale.date).getMonth() === new Date().getMonth());
  const revenue = salesThisMonth.reduce((sum, sale) => sum + sale.total, 0);
  return (
    <div className="min-h-screen bg-navy2 text-white" data-theme="dark">
      <header className="border-b border-white/10 px-5 py-4 flex items-center gap-3">
        <span className="grid place-items-center size-9 rounded-lg bg-danger"><ShieldCheck className="size-5" /></span>
        <div>
          <p className="font-display font-extrabold">Sika Boafo</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Developer Console</p>
        </div>
        <Link to="/" className="ml-auto"><Button variant="secondary" size="sm">Exit console</Button></Link>
      </header>
      <main className="p-5 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold">Platform overview</h1>
          <p className="text-sm text-white/55 mt-1">Private operations dashboard for the connected workspace.</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Products" value={data.products.length} prefix="" icon={<Store className="size-4" />} tone="brand" />
          <StatCard label="Customers" value={data.customers.length} prefix="" icon={<Users className="size-4" />} tone="brand" />
          <StatCard label="Sales this month" value={salesThisMonth.length} prefix="" icon={<Building2 className="size-4" />} tone="ok" />
          <StatCard label="Revenue this month" value={revenue} icon={<CreditCard className="size-4" />} tone="gold" />
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="bg-navy3 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10"><h2 className="font-bold">Workspace products</h2><p className="text-xs text-white/50 mt-1">{data.settings.name}</p></div>
            <div className="overflow-x-auto"><table className="tbl !min-w-[560px]"><thead><tr><th>Name</th><th>Plan</th><th>Region</th><th>Joined</th></tr></thead><tbody>
              {data.products.slice(0, 8).map((product) => <tr key={product.id}><td><span className="flex items-center gap-2 font-semibold text-white"><Avatar name={product.name} size="sm" />{product.name}</span></td><td><Badge tone="brand">{product.category || "Uncategorized"}</Badge></td><td className="text-white/60">{product.stock} {product.unit}</td><td className="text-white/60">{fmtDate(product.updatedAt)}</td></tr>)}
            </tbody></table></div>
          </Card>
          <Card className="bg-navy3 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10"><h2 className="font-bold">Recent sales</h2><p className="text-xs text-white/50 mt-1">Live transactions from this workspace</p></div>
            <div className="overflow-x-auto"><table className="tbl !min-w-[560px]"><thead><tr><th>Business</th><th>Owner</th><th>Type</th><th>Plan</th></tr></thead><tbody>
              {data.sales.slice(0, 8).map((sale) => <tr key={sale.id}><td className="font-semibold text-white">{sale.receipt}</td><td className="text-white/60">{sale.customerName}</td><td className="text-white/60">{sale.items.length} items</td><td><Badge tone={sale.voidedAt ? "danger" : "ok"}>{sale.voidedAt ? "Voided" : "Completed"}</Badge></td></tr>)}
            </tbody></table></div>
          </Card>
        </div>
        <Card className="bg-navy3 border-white/10 p-5 flex items-start gap-3">
          <BarChart3 className="size-5 text-gold mt-0.5" />
          <div><h2 className="font-bold">Connected platform data</h2><p className="text-sm text-white/60 mt-1">This console is reading the authenticated workspace data from the platform.</p></div>
        </Card>
        <KenteBar className="opacity-70" />
      </main>
    </div>
  );
}
