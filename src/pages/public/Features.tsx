import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, KenteBar } from "../../components/ui";
import { Features as FeatureSection } from "./Landing";

export default function Features() {
  return (
    <div>
      <section className="public-hero relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="hero-orb hero-orb-gold" />
        <div aria-hidden className="hero-orb hero-orb-blue" />
        <div aria-hidden className="hero-grid" />
        <KenteBar className="rounded-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <div className="relative z-10 max-w-3xl animate-fade-up">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-gold flex items-center gap-2"><Sparkles className="size-4" /> One calm workspace</p>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[1.05] mt-4">Every part of your business, working together.</h1>
            <p className="text-white/70 text-lg leading-relaxed mt-5 max-w-2xl">Stop stitching together notebooks, calculators and WhatsApp messages. Sika Boafo gives you one clear view of sales, stock, money and customers.</p>
          </div>
        </div>
      </section>
      <FeatureSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-wrap items-center justify-between gap-5">
        <p className="font-display font-bold text-xl text-ink">Ready to see the difference?</p>
        <Link to="/register"><Button size="lg">Start Business <ArrowRight className="size-4" /></Button></Link>
      </div>
    </div>
  );
}
