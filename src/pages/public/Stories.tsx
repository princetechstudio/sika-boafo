import React from "react";
import { ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, KenteBar } from "../../components/ui";

const STORIES = [
  ["Ama’s Provisions", "Retail shop · Osu", "“I finally know which products make me money, and I restock before customers notice a gap.”", "Clearer stock decisions every morning."],
  ["Kojo Fashion Store", "Fashion · Kumasi", "“Our team stops arguing about yesterday’s sales because every transaction has a clear trail.”", "More accountability at the till."],
  ["Esi Beauty Bar", "Salon · Accra", "“The customer history and expense view give me confidence when I plan the next month.”", "A calmer way to grow."],
];

export default function Stories() {
  return <div><section className="public-hero relative overflow-hidden bg-navy text-white"><div aria-hidden className="hero-orb hero-orb-gold" /><div aria-hidden className="hero-grid" /><KenteBar className="rounded-none" /><div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20"><p className="text-sm font-bold uppercase tracking-[0.14em] text-gold flex items-center gap-2"><Quote className="size-4" /> Customer stories</p><h1 className="font-display font-extrabold text-4xl sm:text-6xl max-w-3xl mt-4">Real businesses. Clearer numbers.</h1><p className="text-white/70 text-lg leading-relaxed mt-5 max-w-2xl">See how business owners use Sika Boafo to replace guesswork with practical daily visibility.</p></div></section><section className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-3 gap-6">{STORIES.map(([name, category, quote, result]) => <article key={name} className="rounded-2xl border border-line bg-card p-7 shadow-card hover:-translate-y-1 hover:shadow-lift transition-all"><div className="size-12 rounded-2xl bg-gold-soft text-gold-deep grid place-items-center font-display font-extrabold text-xl">{name[0]}</div><p className="text-xs font-bold uppercase tracking-wider text-brand mt-5">{category}</p><blockquote className="font-display font-bold text-xl text-ink leading-relaxed mt-4">{quote}</blockquote><div className="mt-6 pt-5 border-t border-line flex items-center gap-2 text-sm font-semibold text-ok-deep"><CheckCircle2 className="size-4" />{result}</div></article>)}</div><div className="text-center mt-14"><p className="font-display font-bold text-2xl text-ink">Ready to write your own growth story?</p><Link to="/register"><Button size="lg" className="mt-5">Create your workspace <ArrowRight className="size-4" /></Button></Link></div></section></div>;
}
