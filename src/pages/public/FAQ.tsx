import React from "react";
import { HelpCircle } from "lucide-react";
import { FAQ as FAQSection } from "./Landing";

export default function FAQ() {
  return (
    <div>
      <section className="public-hero relative overflow-hidden bg-card border-b border-line">
        <div aria-hidden className="hero-orb hero-orb-gold" />
        <div aria-hidden className="hero-orb hero-orb-blue" />
        <div aria-hidden className="hero-grid" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-20 text-center animate-fade-up">
          <span className="inline-grid place-items-center size-12 rounded-2xl bg-gold-soft text-gold-deep"><HelpCircle className="size-6" /></span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink mt-5">Questions, answered clearly.</h1>
          <p className="text-sub text-lg mt-4">Everything you need to know before bringing your business numbers into Sika Boafo.</p>
        </div>
      </section>
      <FAQSection />
    </div>
  );
}
