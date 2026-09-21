/** KasaBiz landing page. */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, BadgePercent, BarChart3, Boxes, Calculator,
  CheckCircle2, ChevronDown, Coins, CreditCard, FileWarning, HelpCircle,
  PackageX, Plus, Receipt, ShieldCheck, ShoppingCart, Smartphone, TrendingUp,
  UserRoundPlus, Users, Wallet, Zap, EyeOff, CalendarCheck, MessageSquare,
  Sparkles, Store, Utensils, Scissors,
} from "lucide-react";
import { Badge, Button, Card, KenteBar, Progress } from "../../components/ui";
import { useAnchorNav } from "../../components/layout/PublicLayout";
import { cx, ghs } from "../../lib/format";

export default function Landing() {
  const go = useAnchorNav();
  return (
    <>
      <Hero go={go} />
      <TrustedStrip />
      <TrustStats />
      <ProblemSection />
      <HowItWorks />
      <SolutionsSection go={go} />
      <PricingPreview go={go} />
      <ProofSection />
      <SnapshotSection go={go} />
      <CTABand go={go} />
    </>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero({ go }: { go: (to: string) => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* ambient layers */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 size-[480px] rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute top-64 -left-32 size-[380px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(var(--t-line2) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div className="animate-fade-up">
          <Badge tone="gold" className="mb-5">
            <Smartphone className="size-3.5" /> Built for Ghanaian businesses — priced in GH₵
          </Badge>
          <h1 className="font-display font-extrabold text-[40px] leading-[1.04] sm:text-[54px] lg:text-[60px] text-ink tracking-tight">
            Run Your Business{" "}
            <span className="relative inline-block text-brand">
              Smarter.
              <svg aria-hidden viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full h-3 text-gold" preserveAspectRatio="none">
                <path d="M3 10 C 60 2, 160 2, 217 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 text-lg text-sub leading-relaxed max-w-xl">
            Track sales, expenses, stock, customers and debts in one simple place —
            whether you run a shop in Makola, a salon in Kumasi or a provision store in Tamale.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => go("/register")}>
              Start Business <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go("/#how-it-works")}>
              See How It Works
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-sub">
            {["Secure payment", "Pay in cedis", "Works on any phone"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-ok" /> {t}</li>
            ))}
          </ul>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}

/** Product overview showing the core workspace capabilities. */
function HeroMock() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
      <div aria-hidden className="absolute -inset-6 bg-navy rounded-[28px] rotate-2 opacity-[0.06]" />
      <Card className="relative overflow-hidden shadow-pop">
        <div className="flex items-center gap-2 px-4 h-10 border-b border-line bg-card2">
          <span className="size-2.5 rounded-full bg-danger/70" /><span className="size-2.5 rounded-full bg-gold/80" /><span className="size-2.5 rounded-full bg-ok/70" />
          <span className="ml-3 text-[11px] font-semibold text-faint font-mono">Your business workspace</span>
          <Badge tone="ok" dot className="ml-auto">Ready when you are</Badge>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-faint">Business overview</p>
              <p className="font-display font-extrabold text-xl text-ink">Everything in one place</p>
            </div>
            <span className="grid place-items-center size-9 rounded-lg bg-navy text-gold"><Zap className="size-4" /></span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {[
              { l: "Sales", v: "Track", tone: "text-brand", bg: "bg-brand-soft" },
              { l: "Stock", v: "Control", tone: "text-ok-deep", bg: "bg-ok-soft" },
              { l: "Reports", v: "Understand", tone: "text-warn-deep", bg: "bg-warn-soft" },
            ].map((item) => (
              <div key={item.l} className={cx("rounded-lg p-2.5", item.bg)}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-sub">{item.l}</p>
                <p className={cx("font-display font-extrabold text-[15px] mt-0.5", item.tone)}>{item.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-line bg-card p-4 space-y-3">
            {["Record every sale", "Know what needs restocking", "See profit and cash flow"].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-sm font-semibold text-sub">
                <CheckCircle2 className="size-4 text-ok shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* floating chips */}
      <div className="absolute -left-3 sm:-left-8 top-16 animate-float-y">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-lift">
          <span className="grid place-items-center size-8 rounded-lg bg-ok-soft text-ok-deep"><CheckCircle2 className="size-4" /></span>
          <div>
            <p className="text-[11px] font-bold text-ink">Sale completed</p>
            <p className="text-[10px] text-sub">Fast, clear records</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-2 sm:-right-6 bottom-24 animate-float-y2">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-lift">
          <span className="grid place-items-center size-8 rounded-lg bg-warn-soft text-warn-deep"><PackageX className="size-4" /></span>
          <div>
            <p className="text-[11px] font-bold text-ink">Low stock alert</p>
            <p className="text-[10px] text-sub">Stay ahead of stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ trusted-by strip --------------------------- */

function TrustedStrip() {
  const names = ["Ama's Provisions · Osu", "Kumasi Tech Hub", "Serwaa Beauty Bar", "Cape Coast Fish Mart", "Tema Auto Works", "Adwoa Fabrics", "Northern Shea Co.", "Junction Pharmacy"];
  return (
    <section aria-label="Example businesses" className="border-y border-line bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-6 overflow-hidden">
        <p className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.14em] text-faint shrink-0 w-40">Shopkeepers like</p>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-8 w-max animate-ticker-vertical">
            {[...names, ...names].map((n, i) => (
              <span key={i} className="text-sm font-bold text-sub/80 whitespace-nowrap flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-gold" /> {n}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`.animate-ticker-vertical{animation:ticker-x 26s linear infinite}@keyframes ticker-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  );
}

function TrustStats() {
  return (
    <section className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ["2,500+", "sales records organised"],
          ["98%", "faster daily stock updates"],
          ["24/7", "access from any phone"],
          ["GH₵", "built around your money"],
        ].map(([value, label]) => (
          <div key={label} className="text-center lg:text-left">
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-gold">{value}</p>
            <p className="text-xs sm:text-sm text-white/60 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- problem --------------------------------- */

const PROBLEMS = [
  { icon: <FileWarning className="size-5" />, title: "Lost sales records", desc: "Pages torn, books soaked, figures smudged — yesterday's sales are a mystery.", tilt: "-rotate-2" },
  { icon: <Coins className="size-5" />, title: "Forgotten debts", desc: "“Ma kɔ so hwee” — the GH₵300 a customer owes slips your mind for months.", tilt: "rotate-1" },
  { icon: <EyeOff className="size-5" />, title: "Unknown profit", desc: "Cash in hand, but no idea whether this month actually made money.", tilt: "rotate-2" },
  { icon: <PackageX className="size-5" />, title: "Stock shortages", desc: "A customer wants Blue Jeans — you only find out you're sold out at the till.", tilt: "-rotate-1" },
  { icon: <Wallet className="size-5" />, title: "Untracked expenses", desc: "Trotro fare, pure water, generator fuel… small money leaking every day.", tilt: "rotate-1" },
];

function ProblemSection() {
  return (
    <section className="relative py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-danger flex items-center gap-2 uppercase tracking-wider"><AlertTriangle className="size-4" /> The notebook problem</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">
            Still running your business with a notebook?
          </h2>
          <p className="text-sub mt-4 text-lg">Notebooks are faithful friends — but they don't add up, they don't remind you, and they don't survive rain. Every week they cost you money you can't see.</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PROBLEMS.map((p, i) => (
            <div key={p.title}
              className={cx("group relative rounded-xl border border-line bg-card p-5 shadow-card transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 hover:shadow-lift animate-fade-up", p.tilt)}
              style={{ animationDelay: `${i * 70}ms` }}>
              <div aria-hidden className="absolute inset-x-4 top-0 h-1.5 bg-danger/15 rounded-b" />
              <span className="inline-grid place-items-center size-10 rounded-lg bg-danger-soft text-danger">{p.icon}</span>
              <h3 className="font-display font-bold text-ink mt-3.5">{p.title}</h3>
              <p className="text-[13px] text-sub mt-1.5 leading-relaxed">{p.desc}</p>
              <div aria-hidden className="absolute bottom-3 right-4 ruled w-10 h-7 opacity-60" />
            </div>
          ))}
        </div>

        {/* solution band */}
        <div className="mt-14 rounded-2xl bg-navy text-white overflow-hidden relative">
          <KenteBar className="rounded-none" />
          <div className="p-8 sm:p-10 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">
                Meet Sika Boafo — your business, <span className="text-gold">in your pocket.</span>
              </h3>
              <p className="text-white/70 mt-3 leading-relaxed max-w-lg">
                Record a sale in seconds. Sika Boafo updates your stock, reminds debtors, totals your
                profit and keeps every receipt safe — all in Ghana cedis.
              </p>
            </div>
            <ul className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {[
                { icon: <Calculator className="size-4" />, t: "Profit calculated for you, daily" },
                { icon: <Receipt className="size-4" />, t: "Digital receipts, ready to share" },
                { icon: <ShieldCheck className="size-4" />, t: "Your numbers, safe & backed up" },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/10 px-4 py-3 text-sm font-semibold">
                  <span className="text-gold">{x.icon}</span> {x.t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection({ go }: { go: (to: string) => void }) {
  const solutions = [
    { icon: <Store className="size-5" />, title: "Retail shops", desc: "Know what sold, what is running low and what is actually profitable.", tone: "bg-brand-soft text-brand-deep" },
    { icon: <Utensils className="size-5" />, title: "Food vendors", desc: "Track fast-moving items, daily expenses and cash flow without slowing service.", tone: "bg-gold-soft text-gold-deep" },
    { icon: <Scissors className="size-5" />, title: "Salons & beauty", desc: "Keep customer history, product stock and staff performance in one place.", tone: "bg-info-soft text-info" },
  ];
  return (
    <section id="solutions" className="py-20 lg:py-24 bg-card border-y border-line scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-brand uppercase tracking-wider flex items-center gap-2"><Sparkles className="size-4" /> Built around your day</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">A better way to run the business you already know.</h2>
          </div>
          <button onClick={() => go("/features")} className="text-sm font-bold text-brand hover:text-brand-deep transition flex items-center gap-1">Explore all features <ArrowRight className="size-4" /></button>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {solutions.map((s) => (
            <button key={s.title} onClick={() => go(`/solutions/${s.title === "Retail shops" ? "retail" : s.title === "Food vendors" ? "food" : "salon"}`)} className="text-left rounded-2xl border border-line bg-paper p-6 hover:-translate-y-1 hover:shadow-lift transition-all">
              <span className={cx("grid place-items-center size-11 rounded-xl", s.tone)}>{s.icon}</span>
              <h3 className="font-display font-bold text-lg text-ink mt-5">{s.title}</h3>
              <p className="text-sm text-sub mt-2 leading-relaxed">{s.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand">See your workflow <ArrowRight className="size-3.5" /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section id="proof" className="py-20 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
          <div>
            <p className="text-sm font-bold text-brand uppercase tracking-wider flex items-center gap-2"><MessageSquare className="size-4" /> The Sika Boafo difference</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">From guessing to knowing.</h2>
            <p className="text-sub text-lg mt-4 leading-relaxed">Replace scattered records with a calm, reliable view of every cedi moving through your business.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-danger/20 bg-danger-soft/40 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-danger">Before Sika Boafo</p>
              <ul className="mt-5 space-y-3 text-sm text-sub">
                {["Receipts disappear in drawers", "Stock surprises you at the till", "Profit is a monthly guess"].map((x) => <li key={x} className="flex gap-2"><EyeOff className="size-4 text-danger shrink-0" />{x}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-ok/20 bg-ok-soft/50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-ok-deep">After Sika Boafo</p>
              <ul className="mt-5 space-y-3 text-sm text-sub">
                {["Every sale has a safe digital trail", "Low-stock alerts arrive early", "Daily profit is clear"].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 text-ok-deep shrink-0" />{x}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            ["“I finally know which products make me money.”", "Ama · provision store owner"],
            ["“Our team stops arguing about yesterday’s sales.”", "Kojo · fashion retailer"],
            ["“The dashboard gives me confidence every morning.”", "Esi · beauty business owner"],
          ].map(([quote, author]) => (
            <blockquote key={author} className="rounded-xl border border-line bg-card p-6 shadow-card">
              <p className="font-display font-bold text-ink leading-relaxed">{quote}</p>
              <footer className="mt-4 text-xs font-semibold text-sub">{author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function SnapshotSection({ go }: { go: (to: string) => void }) {
  return (
    <section className="py-20 lg:py-24 bg-card border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-navy text-white overflow-hidden relative">
          <div aria-hidden className="absolute -right-24 -top-32 size-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative p-8 sm:p-12 grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center">
            <div>
              <Badge tone="gold"><CalendarCheck className="size-3.5" /> See it in action</Badge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight mt-4">Your next business decision should take minutes, not guesswork.</h2>
              <p className="text-white/70 mt-4 leading-relaxed max-w-xl">Start with a free workspace or let us walk you through the dashboard using your own business workflow.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="gold" size="lg" onClick={() => go("/register")}>Start Business <ArrowRight className="size-4" /></Button>
                <Button variant="ghost" size="lg" className="!text-white !border-white/20 hover:!bg-white/10" onClick={() => go("/register")}>Create your workspace</Button>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/8 p-5 shadow-pop">
              <div className="flex items-center gap-2 text-sm font-bold"><span className="size-2 rounded-full bg-ok" /> Live business snapshot</div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[["Today’s sales", "GH₵ 1,250"], ["Gross profit", "GH₵ 930"], ["Low stock items", "3 alerts"], ["Debtors to follow up", "5 people"]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/8 border border-white/10 p-3">
                    <p className="text-[11px] text-white/55">{label}</p>
                    <p className="text-base font-extrabold text-gold mt-1">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/45 mt-4">Updated automatically as your team works.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- features -------------------------------- */

const FEATURES = [
  { icon: <ShoppingCart className="size-5" />, tone: "bg-brand-soft text-brand-deep", title: "Sales Management", desc: "A fast till for busy days — record sales, apply discounts, take MoMo or cash, and hand over a neat receipt.", big: true },
  { icon: <Boxes className="size-5" />, tone: "bg-gold-soft text-gold-deep", title: "Inventory", desc: "Know exactly what's on the shelf. Low-stock alerts before you run out.", big: true },
  { icon: <Wallet className="size-5" />, tone: "bg-warn-soft text-warn-deep", title: "Expenses", desc: "Capture rent, light bill, transport and more. See where the money goes." },
  { icon: <Users className="size-5" />, tone: "bg-info-soft text-info", title: "Customers", desc: "Build a book of regulars with phone numbers and purchase history." },
  { icon: <Coins className="size-5" />, tone: "bg-danger-soft text-danger-deep", title: "Debtors", desc: "Track who owes you, set due dates and record every partial payment." },
  { icon: <Receipt className="size-5" />, tone: "bg-ok-soft text-ok-deep", title: "Digital Receipts", desc: "Professional receipts you can print or share on WhatsApp in one tap." },
  { icon: <BarChart3 className="size-5" />, tone: "bg-brand-soft text-brand-deep", title: "Reports", desc: "Sales, profit, expenses and stock value — clear charts, exportable to CSV." },
  { icon: <UserRoundPlus className="size-5" />, tone: "bg-gold-soft text-gold-deep", title: "Staff Management", desc: "Add cashiers and managers with roles, so everyone sees what they should." },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-card border-y border-line scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-bold text-brand uppercase tracking-wider flex items-center gap-2"><Zap className="size-4" /> Everything in one place</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">
              All the numbers your shop needs
            </h2>
          </div>
          <p className="text-sub max-w-sm text-sm leading-relaxed">
            Eight tools that used to need eight notebooks — now on one screen, in cedis, working on the phone in your pocket.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className={cx(
                "group relative rounded-xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-line2 animate-fade-up",
                f.big && "sm:col-span-2"
              )}
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <span className={cx("grid place-items-center size-11 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6", f.tone)}>{f.icon}</span>
                <span aria-hidden className="font-display font-extrabold text-4xl text-line select-none">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-ink mt-4">{f.title}</h3>
              <p className="text-sm text-sub mt-1.5 leading-relaxed">{f.desc}</p>
              {f.big && f.title === "Sales Management" && <MiniPos />}
              {f.big && f.title === "Inventory" && <MiniStock />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniPos() {
  return (
    <div className="mt-5 rounded-lg border border-line bg-card p-3.5 grid grid-cols-3 gap-2">
      {[["Black T-Shirt", 200], ["Blue Jeans", 350], ["Nike Sneakers", 850]].map(([n, p]) => (
        <div key={n as string} className="rounded-md border border-line bg-card2 px-2.5 py-2 hover:border-brand/50 transition cursor-default">
          <p className="text-[11px] font-bold text-ink truncate">{n}</p>
          <p className="text-[11px] font-bold text-brand tnum">{ghs(p as number)}</p>
        </div>
      ))}
      <div className="col-span-3 mt-1 flex items-center justify-between rounded-md bg-navy text-white px-3 py-2">
        <span className="text-[11px] font-semibold flex items-center gap-1.5"><Plus className="size-3" /> 2 items in cart</span>
        <span className="text-[12px] font-extrabold tnum">{ghs(550)}</span>
      </div>
    </div>
  );
}

function MiniStock() {
  const rows = [["Black T-Shirt", 4, 10, "warn"], ["Nike Sneakers", 2, 5, "warn"], ["Khaki Chinos", 0, 5, "danger"]] as const;
  return (
    <div className="mt-5 rounded-lg border border-line bg-card p-3.5 space-y-2.5">
      {rows.map(([n, s, m, t]) => (
        <div key={n} className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold text-ink w-24 truncate">{n}</span>
          <Progress value={(s / m) * 100} tone={t as "warn" | "danger"} className="flex-1" />
          <span className="text-[10px] font-bold text-faint tnum w-8 text-right">{s}/{m}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- how it works ----------------------------- */

export function HowItWorks() {
  const steps = [
    { n: "1", icon: <Store2 />, title: "Create your business", desc: "Sign up free, name your shop and pick your category — retail, food, fashion, salon and more.", time: "2 minutes" },
    { n: "2", icon: <Boxes className="size-6" />, title: "Add your products", desc: "List what you sell with selling price, cost and stock. Import from a simple form or add one by one.", time: "Same day" },
    { n: "3", icon: <TrendingUp className="size-6" />, title: "Record sales & watch your numbers", desc: "Every sale updates stock, profit and debtor books automatically. Your dashboard tells the story.", time: "Every day" },
  ];
  return (
    <section id="how-it-works" className="py-20 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-brand uppercase tracking-wider">How it works</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">From notebook to numbers in three steps</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
          <div aria-hidden className="hidden md:block absolute top-14 left-[18%] right-[18%] border-t-2 border-dashed border-line2" />
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-xl border border-line bg-card p-7 text-center hover:-translate-y-1 hover:shadow-lift transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="relative inline-grid place-items-center size-16 rounded-2xl bg-navy text-gold mb-5">
                {s.icon}
                <span className="absolute -top-2 -right-2 size-7 grid place-items-center rounded-full bg-gold text-navy font-display font-extrabold text-sm shadow-card">{s.n}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-ink">{s.title}</h3>
              <p className="text-sm text-sub mt-2 leading-relaxed">{s.desc}</p>
              <Badge tone="ok" className="mt-4">{s.time}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Store2 = () => <Boxes className="size-6" />;

/* ------------------------------ pricing preview ---------------------------- */

function PricingPreview({ go }: { go: (to: string) => void }) {
  const tiers = [
    { name: "Business", price: 60, desc: "Everything your business needs", features: ["First month GH₵30", "Unlimited products and sales", "Unlimited staff, roles and branches", "Reports, exports and debtor reminders"], hot: true },
  ];
  return (
    <section className="py-20 lg:py-24 bg-card border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm font-bold text-brand uppercase tracking-wider">Simple pricing</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">Everything your business needs.</h2>
          <p className="text-sub mt-3">Pay with MTN MoMo, Telecel Cash or AT Money. No hidden charges.</p>
        </div>
        <div className="mt-12 grid max-w-md mx-auto">
          {tiers.map((t, i) => (
            <div key={t.name} className={cx(
              "relative rounded-xl border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 animate-fade-up",
              t.hot ? "bg-navy text-white border-navy shadow-pop md:-my-4 md:py-11" : "bg-paper border-line hover:shadow-lift"
            )} style={{ animationDelay: `${i * 80}ms` }}>
              {t.hot && (
                <>
                  <KenteBar className="absolute top-0 inset-x-0 rounded-t-xl" />
                  <Badge tone="gold" className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                </>
              )}
              <h3 className={cx("font-display font-bold text-lg", t.hot ? "text-white" : "text-ink")}>{t.name}</h3>
              <p className={cx("text-[13px] mt-0.5", t.hot ? "text-white/60" : "text-sub")}>{t.desc}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className={cx("font-display font-extrabold text-4xl tnum", t.hot ? "text-gold" : "text-ink")}>GH₵{t.price}</span>
                <span className={cx("text-sm font-semibold", t.hot ? "text-white/60" : "text-sub")}>/month</span>
              </p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className={cx("flex items-start gap-2 text-sm", t.hot ? "text-white/85" : "text-sub")}>
                    <CheckCircle2 className={cx("size-4 mt-0.5 shrink-0", t.hot ? "text-gold" : "text-ok")} /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={t.hot ? "gold" : "secondary"} className="mt-6 w-full" onClick={() => go("/pricing")}>
                Choose {t.name}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-sub">
          Need the full comparison?{" "}
          <Link to="/pricing" className="font-bold text-brand hover:text-brand-deep underline underline-offset-4">See detailed pricing</Link>
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQS = [
  { q: "Do I need internet all the time?", a: "Sika Boafo is built mobile-first and light on data. Recording sales works smoothly on 3G, and your numbers sync and back up automatically when you're online." },
  { q: "Can I record Mobile Money payments?", a: "Yes — Cash, MTN Mobile Money, Telecel Cash, AT Money, bank transfer and card are all supported, with a breakdown of how customers pay you." },
  { q: "What happens to my notebook records?", a: "You can start fresh today and add products gradually. Most shopkeepers move their top 20 products in the first week and keep going from there." },
  { q: "Is my business data safe?", a: "Your records belong to you. They're encrypted, backed up daily, and never sold or shared. You can export everything to CSV at any time." },
  { q: "Can my cashier use it without seeing my profit?", a: "On the Business plan you can create roles — cashiers see the till and stock, while only owners and managers see profit and reports." },
  { q: "How do I pay for Business?", a: "With MTN MoMo, Telecel Cash or AT Money — first month GH₵30, then GH₵60/month. No bank account or card needed." },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 lg:py-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-bold text-brand uppercase tracking-wider flex items-center justify-center gap-2"><HelpCircle className="size-4" /> FAQ</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-[42px] leading-tight text-ink mt-3">Questions? We hear you.</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q} className={cx("rounded-xl border transition-all duration-200", open ? "border-brand/40 bg-card shadow-card" : "border-line bg-card hover:border-line2")}>
                <button onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-display font-bold text-[15px] text-ink">{f.q}</span>
                  <ChevronDown className={cx("size-5 shrink-0 text-sub transition-transform duration-200", open && "rotate-180 text-brand")} />
                </button>
                {open && <p className="px-5 pb-5 text-sm text-sub leading-relaxed animate-fade-in">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CTA band -------------------------------- */

function CTABand({ go }: { go: (to: string) => void }) {
  return (
    <section className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-navy text-white">
          <KenteBar className="rounded-none" />
          <div aria-hidden className="absolute -top-20 -right-16 size-72 rounded-full bg-brand/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 left-10 size-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative px-8 py-14 sm:px-14 text-center">
            <BadgePercent className="size-8 text-gold mx-auto" />
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl mt-4 leading-tight">Know your numbers.<br />Grow your business.</h2>
            <p className="text-white/70 mt-4 max-w-md mx-auto">Join thousands of Ghanaian shopkeepers who swapped the notebook for Sika Boafo.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="gold" onClick={() => go("/register")}>Start Business Today <ArrowRight className="size-4" /></Button>
              <Button size="lg" variant="secondary" className="!bg-transparent !text-white !border-white/30 hover:!bg-white/10" onClick={() => go("/login")}>I have an account</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
