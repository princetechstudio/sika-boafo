/** Public marketing layout: sticky navbar + rich footer. */
import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X, MapPin, Phone, Mail, ChevronDown, Instagram, Facebook, Linkedin } from "lucide-react";
import { Button, KenteBar } from "../ui";
import { cx } from "../../lib/format";
import { authService } from "../../services/authService";
import { Logo } from "./AppShell";

const LINKS = [
  { label: "Features", to: "/features" },
  { label: "How it Works", to: "/how-it-works" },
  { label: "Solutions", to: "/solutions/retail" },
  { label: "Pricing", to: "/pricing" },
  { label: "FAQ", to: "/faq" },
];

export function useAnchorNav() {
  const nav = useNavigate();
  const loc = useLocation();
  return (to: string) => {
    if (to.startsWith("/#")) {
      const id = to.slice(2);
      if (loc.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        nav("/");
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 350);
      }
    } else {
      nav(to);
    }
  };
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const go = useAnchorNav();
  const loc = useLocation();
  const signedIn = !!authService.getSession();
  React.useEffect(() => setOpen(false), [loc.pathname]);
  React.useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [loc.pathname]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <Link to="/" aria-label="Sika Boafo home"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Public navigation">
            {LINKS.map((l) => (
             <div key={l.label} className="relative">
             <button onClick={() => l.label === "Solutions" ? setSolutionsOpen((value) => !value) : go(l.to)}
               className="px-3 py-2 rounded-lg text-sm font-semibold text-sub hover:text-ink hover:bg-card transition flex items-center gap-1">
                {l.label}{l.label === "Solutions" && <ChevronDown className="size-3.5" />}
             </button>
             {l.label === "Solutions" && solutionsOpen && (
               <div className="absolute left-0 top-11 w-52 rounded-xl border border-line bg-card p-2 shadow-pop animate-scale-in">
                 {[["Retail shops", "retail"], ["Food vendors", "food"], ["Salons & beauty", "salon"], ["Growing businesses", "sme"]].map(([label, type]) => (
                   <button key={type} onClick={() => { setSolutionsOpen(false); go(`/solutions/${type}`); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-sub hover:bg-brand-soft hover:text-brand transition">{label}</button>
                 ))}
               </div>
             )}
             </div>
            ))}
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-2">
            {signedIn ? (
              <Button variant="navy" onClick={() => go("/dashboard")}>Open Dashboard <ArrowRight className="size-4" /></Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => go("/login")}>Login</Button>
                <Button onClick={() => go("/register")}>Start Business</Button>
              </>
            )}
          </div>
          <button className="md:hidden ml-auto p-2 rounded-lg text-ink hover:bg-card" onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-line bg-card px-4 py-4 space-y-1 animate-fade-in">
            {LINKS.map((l) => (
              <button key={l.label} onClick={() => { setOpen(false); go(l.to); }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-card2">
                {l.label}
              </button>
            ))}
            <div className="flex gap-2 pt-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setOpen(false); go("/login"); }}>Login</Button>
              <Button className="flex-1" onClick={() => { setOpen(false); go("/register"); }}>Start Business</Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={loc.pathname}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
            transition={{ duration: 0.34, ease: [0.22, 0.9, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-navy text-white mt-auto">
        <KenteBar className="rounded-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <Logo dark />
            <p className="text-sm text-white/60 mt-4 max-w-xs leading-relaxed">
              Know Your Numbers. Grow Your Business. The simple manager built for Ghanaian shops, food vendors, salons and SMEs.
            </p>
            <div className="flex items-center gap-2 mt-5 text-xs font-semibold text-white/70">
              <span className="inline-flex w-5 h-3.5 rounded-[3px] overflow-hidden border border-white/20" aria-hidden>
                <span className="w-1/3 bg-[#ce1126]" /><span className="w-1/3 bg-[#fcd116]" /><span className="w-1/3 bg-[#006b3f]" />
              </span>
              Proudly built for Ghana
            </div>
          </div>
          <FooterCol title="Product" items={[["Features", "/features"], ["How it Works", "/how-it-works"], ["Solutions", "/solutions/retail"], ["Pricing", "/pricing"], ["FAQ", "/faq"]]} />
          <FooterCol title="Solutions" items={[["Retail shops", "/solutions/retail"], ["Food vendors", "/solutions/food"], ["Salons & beauty", "/solutions/salon"], ["Growing businesses", "/solutions/sme"]]} />
          <FooterCol title="Resources" items={[["Customer stories", "/stories"], ["Start free", "/register"], ["Open dashboard", "/dashboard"]]} />
          <FooterCol title="Account" items={[["Login", "/login"], ["Create account", "/register"], ["Dashboard", "/dashboard"]]} />
          <div>
            <p className="text-sm font-bold text-white mb-4">Get in touch</p>
            <ul className="space-y-3 text-sm text-white/65">
              <li className="flex items-center gap-2.5"><MapPin className="size-4 text-gold shrink-0" /> Amasaman</li>
              <li className="flex items-center gap-2.5"><Phone className="size-4 text-gold shrink-0" /> 0552380231 · 0240871412</li>
              <li className="flex items-center gap-2.5"><Mail className="size-4 text-gold shrink-0" /> hello@kasabiz.app</li>
            </ul>
            <p className="mt-5 text-xs text-white/45">Pay with MTN MoMo, Telecel Cash or AT Money.</p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://instagram.com" aria-label="Instagram" className="text-white/50 hover:text-gold transition"><Instagram className="size-4" /></a>
              <a href="https://facebook.com" aria-label="Facebook" className="text-white/50 hover:text-gold transition"><Facebook className="size-4" /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="text-white/50 hover:text-gold transition"><Linkedin className="size-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
            <p>© {new Date().getFullYear()} Sika Boafo. Built for Ghanaian businesses.</p>
            <div className="flex items-center gap-3"><button onClick={() => go("/privacy")} className="hover:text-gold transition">Privacy</button><button onClick={() => go("/terms")} className="hover:text-gold transition">Terms</button><span>Akwaaba! 🇬🇭 made with care in Accra</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  const go = useAnchorNav();
  return (
    <div>
      <p className="text-sm font-bold text-white mb-4">{title}</p>
      <ul className="space-y-2.5">
        {items.map(([label, to]) => (
          <li key={label}>
            <button onClick={() => go(to)} className="text-sm text-white/65 hover:text-gold transition font-medium">{label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NavLinkButton({ to, children }: { to: string; children: React.ReactNode }) {
  return <NavLink to={to} className={cx("text-sm font-semibold")}>{children}</NavLink>;
}
