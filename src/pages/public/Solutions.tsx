import React from "react";
import { ArrowRight, BarChart3, CheckCircle2, PackageCheck, ShoppingCart, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, KenteBar } from "../../components/ui";

const SOLUTIONS = {
  retail: {
    name: "Retail shops",
    title: "Turn every shelf into a clearer business decision.",
    description: "Keep your catalogue, sales, stock alerts, customers and profit in one calm workspace built for busy shops.",
    icon: <ShoppingCart className="size-6" />,
    points: ["Fast POS checkout for busy periods", "Low-stock alerts before customers ask", "Profit and sales reports in cedis"],
  },
  food: {
    name: "Food vendors",
    title: "Serve faster. Track every plate. Protect your margins.",
    description: "Record daily sales and expenses quickly, see your best sellers and understand what your food business keeps.",
    icon: <PackageCheck className="size-6" />,
    points: ["Simple daily sales entry", "Expense tracking for ingredients and transport", "Clear end-of-day performance"],
  },
  salon: {
    name: "Salons & beauty",
    title: "Give your team and customers a more organised experience.",
    description: "Manage services, products, customer history and staff activity without relying on loose notes or memory.",
    icon: <Users className="size-6" />,
    points: ["Customer history at a glance", "Track product usage and restocking", "Staff roles and accountable activity"],
  },
  sme: {
    name: "Growing businesses",
    title: "Build a business that is ready for its next branch.",
    description: "Move from owner intuition to shared numbers, controlled access and reports your whole team can trust.",
    icon: <BarChart3 className="size-6" />,
    points: ["Roles and permissions for teams", "Multi-branch stock visibility", "Exportable reports for better decisions"],
  },
} as const;

export default function Solutions() {
  const { type = "retail" } = useParams();
  const solution = SOLUTIONS[type as keyof typeof SOLUTIONS] ?? SOLUTIONS.retail;
  return (
    <div>
      <section className="public-hero relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="hero-orb hero-orb-gold" />
        <div aria-hidden className="hero-orb hero-orb-blue" />
        <div aria-hidden className="hero-grid" />
        <KenteBar className="rounded-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <Badge tone="gold">{solution.icon} Built for {solution.name.toLowerCase()}</Badge>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[1.05] mt-5 max-w-4xl">{solution.title}</h1>
          <p className="text-white/70 text-lg leading-relaxed mt-5 max-w-2xl">{solution.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button variant="gold" size="lg">Start Business <ArrowRight className="size-4" /></Button></Link>
            <Link to="/register"><Button variant="ghost" size="lg" className="!text-white !border-white/20 hover:!bg-white/10">Create your workspace</Button></Link>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-bold text-brand uppercase tracking-wider">A workflow that fits</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mt-3">Less admin. More confidence.</h2>
            <ul className="mt-7 space-y-4">
              {solution.points.map((point) => <li key={point} className="flex items-center gap-3 text-sub"><CheckCircle2 className="size-5 text-ok shrink-0" />{point}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 shadow-lift">
            <div className="flex items-center justify-between border-b border-line pb-4"><span className="font-bold text-ink">Today’s snapshot</span><span className="text-xs font-semibold text-ok-deep">Live view</span></div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {["Sales GH₵ 1,250", "Profit GH₵ 930", "Stock alerts 3", "Customers 48"].map((item) => <div key={item} className="rounded-xl bg-paper border border-line p-4 text-sm font-bold text-ink">{item}</div>)}
            </div>
            <div className="mt-5 h-24 rounded-xl bg-brand-soft relative overflow-hidden"><div className="absolute inset-x-5 bottom-5 h-12 border-b-2 border-brand rotate-[-6deg]" /><div className="absolute inset-x-5 bottom-8 h-10 border-b-2 border-gold rotate-[4deg]" /></div>
          </div>
        </div>
      </section>
      <section className="pb-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap gap-2">{Object.entries(SOLUTIONS).map(([key, value]) => <Link key={key} to={`/solutions/${key}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-sub hover:border-brand hover:text-brand transition">{value.name}</Link>)}</div></section>
    </div>
  );
}
