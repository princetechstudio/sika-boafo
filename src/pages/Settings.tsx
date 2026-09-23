/** Settings — Business / Profile / Notifications / Appearance / Subscription. */
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Building2, Check, CheckCircle2, Crown, KeyRound, Monitor, Moon, RefreshCcw, Save, Sun, UserRound } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Field, Input, PageHeader, Progress, Select, Tabs, Toggle } from "../components/ui";
import { useApp, useTheme } from "../state/store";
import { authService } from "../services/authService";
import { BUSINESS_TYPES, GH_REGIONS } from "../data/mockData";
import { cx } from "../lib/format";

type TabId = "business" | "profile" | "notifications" | "appearance" | "subscription";

export default function Settings() {
  const { data, dispatch, toast } = useApp();
  const { pref, setPref } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const session = authService.getSession();
  const [tab, setTab] = useState<TabId>(() => (
    (location.state as { tab?: TabId } | null)?.tab ?? "business"
  ));
  const [resetOpen, setResetOpen] = useState(false);

  const [biz, setBiz] = useState({ ...data.settings });
  const [profile, setProfile] = useState({
    name: session?.user.name ?? "Prince Ankomah",
    email: session?.user.email ?? "",
    phone: session?.user.phone ?? "",
  });
  const [notif, setNotif] = useState({ lowStock: true, debtReminders: true, dailySummary: false });

  const saveBiz = () => {
    if (biz.name.trim().length < 2) { toast("Business name can't be empty.", "error"); return; }
    dispatch({ type: "SETTINGS_UPDATE", settings: { ...biz, name: biz.name.trim() } });
    toast("Business settings saved.");
  };

  const saveProfile = () => {
    if (profile.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(profile.email)) {
      toast("Check your name and email.", "error"); return;
    }
    localStorage.setItem("kasabiz_profile_v1", JSON.stringify(profile));
    toast("Profile updated. Sign in again to see it everywhere.", "info");
  };

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const salesThisMonth = data.sales.filter((s) => +new Date(s.date) >= +monthStart).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader title="Settings" sub="Business details, appearance and your plan" />

      <Tabs<TabId>
        tabs={[
          { id: "business", label: "Business", icon: <Building2 className="size-4" /> },
          { id: "profile", label: "Profile", icon: <UserRound className="size-4" /> },
          { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
          { id: "appearance", label: "Appearance", icon: <Sun className="size-4" /> },
          { id: "subscription", label: "Subscription", icon: <Crown className="size-4" /> },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "business" && (
        <div className="space-y-4 animate-fade-in">
        <Card className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name" className="sm:col-span-2">
              <Input value={biz.name} onChange={(e) => setBiz((b) => ({ ...b, name: e.target.value }))} />
            </Field>
            <Field label="Business type">
              <Select value={biz.type} onChange={(e) => setBiz((b) => ({ ...b, type: e.target.value }))}>
                {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Phone">
              <Input value={biz.phone} onChange={(e) => setBiz((b) => ({ ...b, phone: e.target.value }))} inputMode="tel" />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <Input value={biz.location} onChange={(e) => setBiz((b) => ({ ...b, location: e.target.value }))} />
            </Field>
            <Field label="Region">
              <Select value={biz.region} onChange={(e) => setBiz((b) => ({ ...b, region: e.target.value }))}>
                {GH_REGIONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={biz.currency} onChange={(e) => setBiz((b) => ({ ...b, currency: e.target.value }))}>
                <option>GHS (GH₵)</option><option disabled>NGN (₦) — coming soon</option><option disabled>KES (KSh) — coming soon</option>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={saveBiz}><Save className="size-4" /> Save Business Details</Button>
          </div>
        </Card>
        </div>
      )}

      {tab === "profile" && (
        <Card className="p-6 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name"><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Email"><Input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} inputMode="tel" /></Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={saveProfile}><Save className="size-4" /> Save Profile</Button>
          </div>
        </Card>
      )}

      {tab === "notifications" && (
        <Card className="p-6 space-y-5 animate-fade-in">
          <Toggle checked={notif.lowStock} onChange={(v) => { setNotif((n) => ({ ...n, lowStock: v })); toast(v ? "Low stock alerts on." : "Low stock alerts off.", "info"); }}
            label="Low stock notifications" desc="Get alerted when a product reaches its minimum stock." />
          <div className="border-t border-line" />
          <Toggle checked={notif.debtReminders} onChange={(v) => { setNotif((n) => ({ ...n, debtReminders: v })); toast(v ? "Debt reminders on." : "Debt reminders off.", "info"); }}
            label="Debt reminders" desc="Automatic reminders for customers with overdue balances." />
          <div className="border-t border-line" />
          <Toggle checked={notif.dailySummary} onChange={(v) => { setNotif((n) => ({ ...n, dailySummary: v })); toast(v ? "Daily summary on." : "Daily summary off.", "info"); }}
            label="Daily sales summary" desc="A closing summary of the day's sales, expenses and profit." />
        </Card>
      )}

      {tab === "appearance" && (
        <div className="grid sm:grid-cols-3 gap-4 animate-fade-in">
          {([
            { id: "light", label: "Light", icon: <Sun className="size-5" />, desc: "Bright and crisp", bg: "#f2f5fb", fg: "#0e1b33" },
            { id: "dark", label: "Dark", icon: <Moon className="size-5" />, desc: "Easy on the eyes", bg: "#0a1120", fg: "#e9effb" },
            { id: "system", label: "System", icon: <Monitor className="size-5" />, desc: "Follows your device", bg: "linear-gradient(105deg,#f2f5fb 50%,#0a1120 50%)", fg: "#1d5bd6" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => { setPref(t.id); toast(`Theme set to ${t.label}.`, "info"); }}
              className={cx("card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift", pref === t.id && "!border-brand ring-2 ring-brand/25")}>
              <span className="block h-20 rounded-lg border border-line mb-4 relative overflow-hidden" style={{ background: t.bg }}>
                <span className="absolute left-2 top-2 w-12 h-1.5 rounded-full" style={{ background: t.fg, opacity: 0.7 }} />
                <span className="absolute left-2 top-5 w-8 h-1.5 rounded-full" style={{ background: t.fg, opacity: 0.35 }} />
                <span className="absolute left-2 bottom-2 w-16 h-4 rounded-md bg-brand/80" />
              </span>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display font-bold text-ink">{t.icon}{t.label}</span>
                {pref === t.id && <span className="grid place-items-center size-5 rounded-full bg-brand text-white"><Check className="size-3" /></span>}
              </span>
              <span className="block text-xs text-sub mt-1">{t.desc}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "subscription" && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-faint uppercase tracking-wider">Current plan</p>
                <p className="font-display font-extrabold text-3xl text-ink mt-1">{data.plan}</p>
              </div>
              <Badge tone={data.plan === "Business" ? "ok" : "gold"}>
                {data.plan === "Business" ? "Paid · Active" : "Payment required"}
              </Badge>
            </div>
            <div className="mt-6 space-y-4">
              <Usage label="Products" used={data.products.length} limit={data.plan === "Free" ? 50 : 100000} free={data.plan !== "Free"} />
              <Usage label="Sales this month" used={salesThisMonth} limit={data.plan === "Free" ? 200 : 100000} free={data.plan !== "Free"} />
              <Usage label="Staff accounts" used={data.staff.length} limit={data.plan === "Free" ? 1 : data.plan === "Pro" ? 3 : 100000} free={data.plan !== "Free"} />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-faint mt-5 border-t border-line pt-4">
              <CheckCircle2 className="size-3.5 text-ok" />
              {data.plan === "Business" ? "Payment verified. Business features are active." : "Payments are verified securely before your plan is activated."}
            </p>
          </Card>
          <Card className="p-6 bg-navy !border-navy text-white">
            <Crown className="size-6 text-gold" />
            <h3 className="font-display font-extrabold text-xl mt-3">Choose your plan</h3>
            <p className="text-sm text-white/65 mt-1">Activate Business with introductory first-month pricing.</p>
            <p className="mt-5 text-sm text-white/70">
              Choose Business from the secure checkout. Your account is upgraded only after Paystack confirms the payment.
            </p>
            <Button variant="gold" className="mt-5" onClick={() => nav("/pricing")}>View plans and pay</Button>
          </Card>
        </div>
      )}

    </div>
  );
}

function Usage({ label, used, limit, free }: { label: string; used: number; limit: number; free: boolean }) {
  const pct = free ? Math.min(6, (used / limit) * 100) : (used / limit) * 100;
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-1.5">
        <span className="font-semibold text-sub">{label}</span>
        <span className="font-bold text-ink tnum">{used.toLocaleString("en-GH")} {free ? "" : `/ ${limit}`}</span>
      </div>
      <Progress value={pct} tone={pct > 85 ? "warn" : "brand"} />
    </div>
  );
}
