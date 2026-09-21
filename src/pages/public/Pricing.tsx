/** Detailed pricing page with plan comparison. */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Minus, ArrowRight, Zap } from "lucide-react";
import { Badge, Button, KenteBar, Modal } from "../../components/ui";
import { cx, ghs } from "../../lib/format";
import { useAnchorNav } from "../../components/layout/PublicLayout";
import { useApp } from "../../state/store";
import { authService } from "../../services/authService";
import { startPaystackCheckout, verifyPaystackPayment } from "../../services/paystackService";

const TIERS = [
  {
    name: "Business", price: 60, tag: "Everything your business needs", hot: true,
    blurb: "Roles, branches and priority support for bigger operations.",
    cta: "Get Business",
  },
];

const ROWS: Array<{ label: string; value: React.ReactNode }> = [
  { label: "Businesses", value: "Up to 3 branches" },
  { label: "Products", value: "Unlimited" },
  { label: "Sales & digital receipts", value: true },
  { label: "Customer book & debtors", value: true },
  { label: "Expense tracking", value: true },
  { label: "Reports & charts", value: true },
  { label: "CSV export", value: true },
  { label: "Staff accounts", value: "Unlimited" },
  { label: "Roles & permissions", value: true },
  { label: "Multi-branch stock", value: true },
  { label: "Priority support", value: true },
];

export default function Pricing() {
  const go = useAnchorNav();
  const nav = useNavigate();
  const { data, dispatch, toast } = useApp();
  const signedIn = !!authService.getSession();
  const [months, setMonths] = React.useState(1);
  const [selectedTier, setSelectedTier] = React.useState<typeof TIERS[number] | null>(null);
  const [paymentComplete, setPaymentComplete] = React.useState(false);

  const [paying, setPaying] = React.useState(false);

  const continueWithTier = async (tier: typeof TIERS[number]) => {
    if (!signedIn) {
      go("/register");
      return;
    }
    const session = authService.getSession();
    if (!session) {
      go("/login");
      return;
    }
    setPaying(true);
    try {
      const transaction = await startPaystackCheckout({
        email: session.user.email,
        businessId: session.business.id,
        months,
      });
      await verifyPaystackPayment({
        reference: transaction.reference,
        email: session.user.email,
        businessId: session.business.id,
        months,
      });
      dispatch({ type: "PLAN_CONFIRMED", plan: "Business" });
      toast(`${tier.name} payment successful. Welcome to Sika Boafo Business.`, "success");
      setSelectedTier(null);
      setPaymentComplete(true);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Payment could not be completed.", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="relative py-16 lg:py-20 overflow-hidden">
      <div aria-hidden className="hero-orb hero-orb-gold" />
      <div aria-hidden className="hero-orb hero-orb-blue" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto animate-fade-up">
          <Badge tone="brand" className="mb-4"><Zap className="size-3.5" /> Fair pricing in cedis</Badge>
          <h1 className="font-display font-extrabold text-4xl sm:text-[52px] leading-tight text-ink">
            Business plans that fit your growth
          </h1>
          <p className="text-sub text-lg mt-4">
            Pay for one or more months with MTN MoMo, Telecel Cash or AT Money. Your first month is GH₵30, then each additional month is GH₵60.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <label htmlFor="months" className="text-sm font-bold text-sub">Pay for</label>
            <select id="months" value={months} onChange={(event) => setMonths(Number(event.target.value))}
              className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-bold text-ink">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value} {value === 1 ? "month" : "months"}</option>
              ))}
            </select>
            <span className="text-sm font-bold text-brand">GH₵{30 + (months - 1) * 60}</span>
          </div>
        </div>

        <div className="mt-14 grid max-w-md mx-auto">
          {TIERS.map((t, i) => {
            const price = 30 + (months - 1) * 60;
            return (
              <div key={t.name} className={cx(
                "relative rounded-2xl border p-8 flex flex-col animate-fade-up",
                t.hot ? "bg-navy text-white border-navy shadow-pop lg:-my-5 lg:py-[52px]" : "bg-card border-line hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
              )} style={{ animationDelay: `${i * 90}ms` }}>
                {t.hot && (
                  <>
                    <KenteBar className="absolute top-0 inset-x-0 rounded-t-2xl" />
                    <Badge tone="gold" className="absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-card">Most popular</Badge>
                  </>
                )}
                <p className={cx("text-sm font-bold uppercase tracking-wider", t.hot ? "text-gold" : "text-brand")}>{t.tag}</p>
                <h2 className={cx("font-display font-extrabold text-2xl mt-1", t.hot ? "text-white" : "text-ink")}>{t.name}</h2>
                <p className={cx("text-sm mt-1", t.hot ? "text-white/60" : "text-sub")}>{t.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className={cx("font-display font-extrabold text-5xl tnum", t.hot ? "text-gold" : "text-ink")}>{ghs(price)}</span>
                  <span className={cx("text-sm font-semibold", t.hot ? "text-white/60" : "text-sub")}>/{months === 1 ? "first month" : `${months} months`}</span>
                </div>
                <p className="text-xs text-gold mt-1">First month GH₵30, then GH₵60 per additional month</p>
                <ul className={cx("mt-6 space-y-3 flex-1 text-sm", t.hot ? "text-white/85" : "text-sub")}>
                  {ROWS.slice(0, 8).map((r) => (
                    <li key={r.label} className="flex items-start gap-2.5">
                      <Check className={cx("size-4 mt-0.5 shrink-0", t.hot ? "text-gold" : "text-ok")} />
                      <span>{r.label}{typeof r.value === "string" && <b className="text-white"> — {r.value}</b>}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="gold" size="lg" className="mt-8 w-full"
                  onClick={() => setSelectedTier(t)}>
                  {signedIn && data.plan === t.name ? "Current plan" : t.cta} <ArrowRight className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* full comparison */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink text-center">Compare every feature</h2>
          <div className="mt-8 card overflow-hidden">
            <div className="tbl-wrap">
              <table className="tbl !min-w-[560px]">
                <thead>
                  <tr>
                    <th className="w-[40%]">Feature</th>
                    {TIERS.map((t) => (
                      <th key={t.name} className={cx("text-center", t.hot && "!text-brand")}>{t.name}{t.hot && <span className="ml-1.5 align-middle inline-block w-1.5 h-1.5 rounded-full bg-gold" />}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.label}>
                      <td className="font-semibold text-ink">{r.label}</td>
                      <td className="text-center">
                        {r.value === true ? <Check className="size-4 text-ok inline" />
                          : <span className="text-[13px] font-bold text-ink">{r.value}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* reassurance */}
        <div className="mt-16 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { t: "Introductory pricing", d: "Start with your first month at GH₵30, then continue at GH₵60/month." },
            { t: "MoMo-first billing", d: "Pay with the wallet you already use. We prompt you — no card forms." },
            { t: "Free onboarding", d: "Our Accra team will help you set up your business and products." },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-line bg-card p-5 text-center hover:-translate-y-0.5 hover:shadow-lift transition-all">
              <p className="font-display font-bold text-ink">{x.t}</p>
              <p className="text-[13px] text-sub mt-1.5 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" onClick={() => go("/register")}>Create your account <ArrowRight className="size-4" /></Button>
          <p className="text-xs text-faint mt-3">Prices include all taxes. You can cancel anytime.</p>
        </div>
      </div>
      <Modal
        open={!!selectedTier || paymentComplete}
        onClose={() => {
          setSelectedTier(null);
          setPaymentComplete(false);
        }}
        title={paymentComplete ? "Payment successful" : selectedTier ? `Upgrade to ${selectedTier.name}` : undefined}
        sub={paymentComplete ? "Your Business plan is now active." : "See what your business unlocks next."}
        footer={
          paymentComplete ? (
            <Button onClick={() => nav("/dashboard", { replace: true })}>
              Open dashboard <ArrowRight className="size-4" />
            </Button>
          ) : selectedTier && (
            <>
              <Button variant="secondary" onClick={() => setSelectedTier(null)}>Maybe later</Button>
              <Button variant={selectedTier.hot ? "gold" : "primary"} loading={paying} onClick={() => void continueWithTier(selectedTier)}>
                {signedIn ? `Choose ${selectedTier.name}` : "Continue to account"} <ArrowRight className="size-4" />
              </Button>
            </>
          )
        }
      >
        {paymentComplete ? (
          <div role="status" className="rounded-xl border border-ok/30 bg-ok-soft px-4 py-4 text-sm text-ok">
            Your payment was confirmed and your plan has been activated. Click <b>Open dashboard</b> to start using Sika Boafo.
          </div>
        ) : selectedTier && (
          <div className="space-y-5">
            <div className={cx("rounded-xl p-4 border", selectedTier.hot ? "bg-navy border-navy text-white" : "bg-brand-soft border-brand/10")}>
              <p className={cx("text-xs font-bold uppercase tracking-wider", selectedTier.hot ? "text-gold" : "text-brand")}>{selectedTier.tag}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={cx("font-display font-extrabold text-4xl tnum", selectedTier.hot ? "text-gold" : "text-ink")}>{ghs(30 + (months - 1) * 60)}</span>
                <span className={cx("text-sm", selectedTier.hot ? "text-white/60" : "text-sub")}>/{months === 1 ? "first month" : `${months} months`}</span>
              </div>
              <p className={cx("text-sm mt-2", selectedTier.hot ? "text-white/70" : "text-sub")}>{selectedTier.blurb}</p>
            </div>
            <div>
              <p className="font-display font-bold text-ink">Everything included</p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {ROWS.map((row) => (
                  <li key={row.label} className="flex items-start gap-2 text-sm text-sub">
                    <Check className="size-4 mt-0.5 text-ok shrink-0" />
                    <span>{row.label}{typeof row.value === "string" && ` — ${row.value}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-faint border-t border-line pt-4">Secure checkout powered by Paystack. Your plan activates after payment confirmation.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
