import React from "react";
import { ArrowRight, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { HowItWorks as HowItWorksSection } from "./Landing";

export default function HowItWorks() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 lg:pt-20">
        <div className="public-hero relative overflow-hidden rounded-3xl bg-brand-soft border border-brand/10 p-8 sm:p-14 animate-fade-up">
          <div aria-hidden className="hero-orb hero-orb-gold" />
          <div aria-hidden className="hero-orb hero-orb-blue" />
          <div aria-hidden className="hero-grid" />
          <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand flex items-center gap-2"><Route className="size-4" /> A simpler daily rhythm</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[1.05] text-ink mt-4 max-w-3xl">Set up once. Make better decisions every day.</h1>
          <p className="text-sub text-lg leading-relaxed mt-5 max-w-2xl">Sika Boafo fits around how Ghanaian businesses already work, so your first useful report is never weeks away.</p>
          </div>
        </div>
      </section>
      <HowItWorksSection />
      <div className="text-center pb-16">
        <Link to="/register"><Button size="lg">Create your account <ArrowRight className="size-4" /></Button></Link>
      </div>
    </div>
  );
}
