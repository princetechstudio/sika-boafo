import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Building2, CheckCircle2, CreditCard, RefreshCw, ShieldCheck, Users, XCircle } from "lucide-react";
import { Badge, Button, Card, KenteBar, StatCard } from "../components/ui";
import { supabase } from "../lib/supabase";

type Business = {
  id: string;
  name: string;
  business_type: string;
  region: string | null;
  plan: string;
  created_at: string;
  members: number;
};

type Payment = {
  reference: string;
  amount: number;
  currency: string;
  status: "success" | "failed";
  created_at: string;
  businesses: { name: string } | null;
};

type Overview = {
  generatedAt: string;
  summary: {
    businesses: number;
    paidBusinesses: number;
    unpaidBusinesses: number;
    users: number;
    activeMembers: number;
    successfulPayments: number;
    failedPayments: number;
    revenue: number;
  };
  businesses: Business[];
  payments: Payment[];
};

const money = (amount: number) => `GH₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value: string) => new Date(value).toLocaleDateString("en-GH", { dateStyle: "medium" });

export default function Admin() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    const { data, error: requestError } = await supabase.functions.invoke("admin-overview", { method: "GET" });
    if (requestError) {
      setError(requestError.message || "Unable to load administrator data.");
    } else if (!data?.summary) {
      setError(data?.error || "Unable to load administrator data.");
    } else {
      setOverview(data as Overview);
    }
    setLoading(false);
  };

  useEffect(() => { void loadOverview(); }, []);

  return (
    <div className="min-h-screen bg-navy2 text-white" data-theme="dark">
      <header className="border-b border-white/10 px-5 py-4 flex items-center gap-3">
        <span className="grid place-items-center size-9 rounded-lg bg-danger"><ShieldCheck className="size-5" /></span>
        <div>
          <p className="font-display font-extrabold">Sika Boafo</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Platform Admin</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void loadOverview()} disabled={loading}>
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh
          </Button>
          <Link to="/"><Button variant="secondary" size="sm">Exit console</Button></Link>
        </div>
      </header>
      <main className="p-5 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold">Platform overview</h1>
          <p className="text-sm text-white/55 mt-1">Private operations view for businesses, users, and verified payments.</p>
        </div>
        {error && (
          <Card className="bg-danger/10 border-danger/30 p-4 flex items-start gap-3">
            <XCircle className="size-5 text-danger shrink-0" />
            <div><p className="font-semibold">Could not load admin data</p><p className="text-sm text-white/65 mt-1">{error}</p></div>
          </Card>
        )}
        {loading && !overview ? (
          <Card className="bg-navy3 border-white/10 p-8 text-center text-white/60">Loading platform data...</Card>
        ) : overview ? (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <StatCard label="Businesses" value={overview.summary.businesses} prefix="" icon={<Building2 className="size-4" />} tone="brand" />
              <StatCard label="Active users" value={overview.summary.users} prefix="" icon={<Users className="size-4" />} tone="brand" />
              <StatCard label="Paid businesses" value={overview.summary.paidBusinesses} prefix="" icon={<CheckCircle2 className="size-4" />} tone="ok" />
              <StatCard label="Verified revenue" value={overview.summary.revenue} icon={<CreditCard className="size-4" />} tone="gold" />
            </div>
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="bg-navy3 border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10"><h2 className="font-bold">Businesses</h2><p className="text-xs text-white/50 mt-1">{overview.summary.unpaidBusinesses} awaiting payment · {overview.summary.activeMembers} active members</p></div>
                <div className="overflow-x-auto"><table className="tbl !min-w-[620px]"><thead><tr><th>Business</th><th>Type</th><th>Members</th><th>Plan</th><th>Joined</th></tr></thead><tbody>
                  {overview.businesses.map((business) => <tr key={business.id}><td className="font-semibold text-white">{business.name}</td><td className="text-white/60">{business.business_type}</td><td className="text-white/60">{business.members}</td><td><Badge tone={business.plan === "Business" ? "ok" : "neutral"}>{business.plan}</Badge></td><td className="text-white/60">{date(business.created_at)}</td></tr>)}
                </tbody></table></div>
              </Card>
              <Card className="bg-navy3 border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10"><h2 className="font-bold">Payment activity</h2><p className="text-xs text-white/50 mt-1">{overview.summary.successfulPayments} successful · {overview.summary.failedPayments} failed</p></div>
                <div className="overflow-x-auto"><table className="tbl !min-w-[620px]"><thead><tr><th>Business</th><th>Reference</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>
                  {overview.payments.map((payment) => <tr key={payment.reference}><td className="font-semibold text-white">{payment.businesses?.name ?? "Unknown"}</td><td className="text-white/60">{payment.reference}</td><td className="text-white/60">{payment.currency} {Number(payment.amount).toFixed(2)}</td><td><Badge tone={payment.status === "success" ? "ok" : "danger"}>{payment.status}</Badge></td><td className="text-white/60">{date(payment.created_at)}</td></tr>)}
                </tbody></table></div>
              </Card>
            </div>
            <Card className="bg-navy3 border-white/10 p-5 flex items-start gap-3">
              <BarChart3 className="size-5 text-gold mt-0.5" />
              <div><h2 className="font-bold">Read-only by design</h2><p className="text-sm text-white/60 mt-1">This dashboard uses a protected server function. It does not expose service-role credentials or allow browser-side changes to customer data.</p><p className="text-xs text-white/40 mt-2">Last updated {date(overview.generatedAt)}</p></div>
            </Card>
          </>
        ) : null}
        <KenteBar className="opacity-70" />
      </main>
    </div>
  );
}
