/** Shared split-screen frame for Login / Register. */
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";
import { KenteBar } from "../../components/ui";
import { Logo } from "../../components/layout/AppShell";

export default function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.15fr] bg-paper">
      {/* brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-navy text-white p-10 relative overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full bg-brand/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-gold/12 blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition">
            <ArrowLeft className="size-4" /> Back to Sika Boafo
          </Link>
          <div className="mt-10"><Logo dark /></div>
          <h2 className="font-display font-extrabold text-[34px] leading-tight mt-8 max-w-md">
            Know Your Numbers.<br /><span className="text-gold">Grow Your Business.</span>
          </h2>
          <div className="mt-8 space-y-4 max-w-sm">
            {[
              { icon: <Zap className="size-4" />, text: "Record a sale in under 10 seconds" },
              { icon: <TrendingUp className="size-4" />, text: "Daily profit, ready before you close shop" },
              { icon: <Users className="size-4" />, text: "Debtor book that never forgets" },
            ].map((x) => (
              <p key={x.text} className="flex items-center gap-3 text-sm font-semibold text-white/85">
                <span className="grid place-items-center size-8 rounded-lg bg-white/10 text-gold">{x.icon}</span> {x.text}
              </p>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="rounded-xl bg-white/6 border border-white/10 p-5 max-w-md">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/85"><CheckCircle2 className="size-4 text-gold" /> Your business data stays in your secure workspace.</p>
          </div>
          <KenteBar className="mt-8 opacity-90" />
        </div>
      </aside>

      {/* form panel */}
      <main className="flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link to="/"><Logo /></Link>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sub hover:text-ink transition">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </div>
          <div className="card p-6 sm:p-8">{children}</div>
          <p className="text-center text-xs text-faint mt-6">
            Authentication is secured by Supabase.
          </p>
        </div>
      </main>
    </div>
  );
}
