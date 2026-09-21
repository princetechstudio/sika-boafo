/** Authenticated app shell: sidebar (desktop), drawer (tablet), bottom nav (mobile). */
import React, { Suspense, useCallback, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowLeftRight, Bell, Boxes, CreditCard, FileText,
  LayoutDashboard, LogOut, Menu, PackagePlus, PanelLeftClose, PanelLeftOpen,
  Receipt, ScrollText, Settings, ShieldCheck, ShoppingCart, Store, UserRound,
  Users, Wallet, X, Zap, CheckCircle2, Info, XCircle,
} from "lucide-react";
import { useApp, useTheme } from "../../state/store";
import type { Toast } from "../../state/store";
import { authService } from "../../services/authService";
import { getDebtors, getLowStock } from "../../services/dataService";
import { Avatar, Badge, Button, KenteBar } from "../ui";
import { cx } from "../../lib/format";
import { useClickOutside } from "../../lib/hooks";

/* ---------------------------------- logo ---------------------------------- */

export function Logo({ dark, small }: { dark?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <img src="/logo.png" alt="" className={cx("rounded-lg object-contain", small ? "size-9" : "size-11")} />
      {!small && (
        <span className={cx("font-display font-extrabold text-xl tracking-tight", dark ? "text-white" : "text-ink")}>
          Sika <span className={dark ? "text-gold" : "text-brand"}>Boafo</span>
        </span>
      )}
    </span>
  );
}

/* --------------------------------- nav data -------------------------------- */

const NAV: Array<{ group: string; items: Array<{ to: string; label: string; detail?: string; icon: React.ReactNode; end?: boolean }> }> = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", detail: "Overview & KPIs", icon: <LayoutDashboard className="size-[18px]" /> }] },
  {
    group: "Sell",
    items: [
      { to: "/sales/new", label: "New Sale", detail: "POS checkout", icon: <Zap className="size-[18px]" /> },
      { to: "/sales", label: "Sales", detail: "Transactions & history", icon: <ShoppingCart className="size-[18px]" /> },
      { to: "/receipts", label: "Receipts", detail: "Print & review", icon: <Receipt className="size-[18px]" /> },
      { to: "/customers", label: "Customers", detail: "Contacts & repeat buyers", icon: <Users className="size-[18px]" /> },
      { to: "/debtors", label: "Debtors", detail: "Outstanding balances", icon: <CreditCard className="size-[18px]" /> },
    ],
  },
  {
    group: "Manage",
    items: [
      { to: "/products", label: "Products", detail: "Catalogue & pricing", icon: <Boxes className="size-[18px]" /> },
      { to: "/inventory", label: "Inventory", detail: "Stock control", icon: <PackagePlus className="size-[18px]" /> },
      { to: "/purchases", label: "Purchases", detail: "Suppliers & restocks", icon: <ArrowLeftRight className="size-[18px]" /> },
      { to: "/expenses", label: "Expenses", detail: "Running costs", icon: <Wallet className="size-[18px]" /> },
    ],
  },
  { group: "Insights", items: [{ to: "/reports", label: "Reports", detail: "Profit & trends", icon: <ScrollText className="size-[18px]" /> }] },
  {
    group: "Workspace",
    items: [
      { to: "/staff", label: "Staff", detail: "Roles & access", icon: <UserRound className="size-[18px]" /> },
      { to: "/settings", label: "Settings", detail: "Business preferences", icon: <Settings className="size-[18px]" /> },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard", "/sales/new": "New Sale", "/sales": "Sales",
  "/receipts": "Receipts", "/customers": "Customers", "/debtors": "Debtors",
  "/products": "Products", "/inventory": "Inventory", "/purchases": "Purchases",
  "/expenses": "Expenses", "/reports": "Reports", "/staff": "Staff", "/settings": "Settings",
};

/* --------------------------------- sidebar --------------------------------- */

function SidebarContent({ collapsed, onNavigate, onToggle }: {
  collapsed: boolean; onNavigate?: () => void; onToggle?: () => void;
}) {
  const { data } = useApp();
  const low = getLowStock(data.products).length;
  return (
    <div className="flex flex-col h-full">
      <div className={cx("flex items-center gap-2 px-4 h-16 border-b border-white/8", collapsed && "justify-center px-2")}>
        <Logo dark small={collapsed} />
        {onToggle && !collapsed && (
          <button onClick={onToggle} aria-label="Collapse sidebar"
            className="ml-auto p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 no-scrollbar" aria-label="Main navigation">
        {NAV.map((g) => (
          <div key={g.group}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{g.group}</p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink to={it.to} onClick={onNavigate} title={collapsed ? it.label : undefined}
                    className={({ isActive }) => cx(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      collapsed && "justify-center px-2",
                      isActive ? "bg-white/12 text-white" : "text-white/60 hover:text-white hover:bg-white/6"
                    )}>
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gold" />}
                        <span className={cx(isActive && "text-gold")}>{it.icon}</span>
                        {!collapsed && (
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-left">{it.label}</span>
                            {it.detail && (
                              <span className="mt-0.5 block text-[10px] font-medium tracking-[0.02em] text-white/45 text-left">{it.detail}</span>
                            )}
                          </span>
                        )}
                        {!collapsed && it.to === "/inventory" && low > 0 && (
                          <span className="ml-auto text-[10px] font-bold bg-warn text-navy rounded-full px-1.5 py-0.5 tnum">{low}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-3 space-y-3">
          <div className="rounded-xl bg-gold/15 border border-gold/25 p-3.5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-gold">
              <ShieldCheck className="size-4" /> {data.plan} plan
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ok mt-2">
              <CheckCircle2 className="size-3.5" /> {data.plan === "Business" ? "Paid and active" : "Payment required"}
            </p>
            <p className="text-xs text-white/55 mt-1">
              {data.plan === "Business" ? "Your account is ready for business features." : "GH₵30 first month, then GH₵60/month."}
            </p>
          </div>
          <KenteBar className="opacity-80" />
        </div>
      )}
    </div>
  );
}

/* --------------------------------- toasts ---------------------------------- */

const TOAST_ICON: Record<Toast["tone"], React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-ok" />,
  error: <XCircle className="size-5 text-danger" />,
  info: <Info className="size-5 text-info" />,
  warning: <AlertTriangle className="size-5 text-warn" />,
};

export function ToastHost() {
  const { toasts } = useApp();
  return (
    <div aria-live="polite" className="fixed z-[70] bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-[340px] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-pop animate-slide-left">
          {TOAST_ICON[t.tone]}
          <p className="text-sm font-semibold text-ink flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- shell ---------------------------------- */

export default function AppShell() {
  const { data, dataLoading, dispatch, toast } = useApp();
  useTheme(); // keeps the document theme in sync with the saved preference
  const nav = useNavigate();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const bellRef = useClickOutside<HTMLDivElement>(useCallback(() => setBellOpen(false), []));
  const userRef = useClickOutside<HTMLDivElement>(useCallback(() => setUserOpen(false), []));

  const lowStock = useMemo(() => getLowStock(data.products), [data.products]);
  const debtors = useMemo(() => getDebtors(data), [data]);
  const overdue = debtors.filter((d) => d.status === "Overdue");
  const alerts = lowStock.length + overdue.length;
  const title = TITLES[loc.pathname] ?? "Sika Boafo";

  const session = authService.getSession();
  const userName = session?.user.name ?? "Prince";
  const bizName = data.settings.name;

  React.useEffect(() => { setDrawer(false); setUserOpen(false); setBellOpen(false); }, [loc.pathname]);

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-paper grid place-items-center">
        <div className="text-center">
          <img src="/logo.png" alt="Sika Boafo" className="size-16 mx-auto rounded-2xl object-contain animate-pulse" />
          <p className="text-sm text-sub mt-3">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const logout = async () => {
    await authService.logout();
    toast("Signed out. Medaase — see you soon!", "info");
    nav("/login");
  };

  const bottomNav = [
    { to: "/dashboard", label: "Home", icon: <LayoutDashboard className="size-5" /> },
    { to: "/sales", label: "Sales", icon: <ShoppingCart className="size-5" /> },
    { to: "/sales/new", label: "Sell", icon: <Zap className="size-6" />, primary: true },
    { to: "/inventory", label: "Stock", icon: <Boxes className="size-5" /> },
    { to: "/reports", label: "Reports", icon: <ScrollText className="size-5" /> },
  ];

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-paper">
      {/* desktop / tablet sidebar */}
      <aside className={cx(
        "hidden md:flex fixed inset-y-0 left-0 z-40 bg-navy transition-[width] duration-200 flex-col",
        collapsed ? "w-[68px]" : "w-60"
      )}>
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar"
            className="absolute -right-3 top-20 size-6 grid place-items-center rounded-full bg-navy border border-line text-white shadow-card hover:bg-navy3 transition">
            <PanelLeftOpen className="size-3.5" />
          </button>
        )}
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy2/60 animate-fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[268px] bg-navy shadow-pop animate-fade-in flex flex-col" style={{ animation: "fade-in .2s ease both" }}>
            <button onClick={() => setDrawer(false)} aria-label="Close menu"
              className="absolute right-3 top-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 z-10">
              <X className="size-5" />
            </button>
            <SidebarContent collapsed={false} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      {/* main column */}
      <div className={cx("min-w-0 transition-[padding] duration-200", collapsed ? "md:pl-[68px]" : "md:pl-60")}>
        {/* topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-line bg-card/90 backdrop-blur flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setDrawer(true)} aria-label="Open menu"
            className="md:hidden p-2 -ml-1 rounded-lg text-sub hover:text-ink hover:bg-card2 transition">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-[17px] text-ink leading-tight truncate">{title}</h1>
            <p className="hidden sm:flex items-center gap-1.5 text-xs text-sub truncate">
              <Store className="size-3" /> {bizName}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {loc.pathname !== "/sales/new" && (
              <Button size="sm" onClick={() => nav("/sales/new")} className="hidden sm:inline-flex">
                <Zap className="size-4" /> New Sale
              </Button>
            )}

            {/* notifications */}
            <div className="relative" ref={bellRef}>
              <button onClick={() => setBellOpen((o) => !o)} aria-label={`Notifications (${alerts})`} aria-expanded={bellOpen}
                className="relative p-2 rounded-lg text-sub hover:text-ink hover:bg-card2 transition">
                <Bell className="size-5" />
                {alerts > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 grid place-items-center rounded-full bg-danger text-white text-[9px] font-bold tnum">{alerts}</span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] card shadow-pop overflow-hidden animate-scale-in origin-top-right">
                  <p className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-faint border-b border-line bg-card2">Alerts</p>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts === 0 && <p className="px-4 py-6 text-sm text-sub text-center">All caught up. No alerts.</p>}
                    {overdue.map((d) => (
                      <button key={d.customer.id} onClick={() => { nav("/debtors"); }}
                        className="w-full text-left px-4 py-3 flex gap-3 hover:bg-card2 transition border-b border-line">
                        <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" />
                        <span className="text-[13px]"><b className="text-ink">{d.customer.name}</b>
                          <span className="text-sub"> — GH₵{d.outstanding.toLocaleString()} overdue</span></span>
                      </button>
                    ))}
                    {lowStock.slice(0, 5).map((p) => (
                      <button key={p.id} onClick={() => nav("/inventory")}
                        className="w-full text-left px-4 py-3 flex gap-3 hover:bg-card2 transition border-b border-line last:border-0">
                        <Boxes className="size-4 text-warn shrink-0 mt-0.5" />
                        <span className="text-[13px]"><b className="text-ink">{p.name}</b>
                          <span className="text-sub"> — {p.stock} left (min {p.minStock})</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* user menu */}
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen((o) => !o)} aria-expanded={userOpen}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-card2 transition">
                <Avatar name={userName} size="sm" />
                <span className="hidden sm:block text-sm font-semibold text-ink">{userName.split(" ")[0]}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-60 card shadow-pop overflow-hidden animate-scale-in origin-top-right">
                  <div className="px-4 py-3 border-b border-line bg-card2">
                    <p className="text-sm font-bold text-ink truncate">{userName}</p>
                    <p className="text-xs text-sub truncate">{bizName}</p>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => nav("/settings")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink hover:bg-card2 transition"><Settings className="size-4 text-sub" /> Settings</button>
                    <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger-soft transition"><LogOut className="size-4" /> Sign out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* page */}
        <main className="min-w-0 px-4 sm:px-6 py-6 pb-28 lg:pb-10 max-w-[1400px] mx-auto" key={loc.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-card/95 backdrop-blur">
        <div className="grid grid-cols-5 items-end px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
          {bottomNav.map((b) =>
            b.primary ? (
              <button key={b.to} onClick={() => nav(b.to)} aria-label="New sale"
                className="justify-self-center -mt-6 size-14 grid place-items-center rounded-2xl bg-brand text-white shadow-pop border-4 border-paper active:scale-95 transition">
                {b.icon}
              </button>
            ) : (
              <NavLink key={b.to} to={b.to}
                className={({ isActive }) => cx("flex flex-col items-center gap-0.5 py-1 rounded-lg text-[10px] font-semibold transition",
                  isActive ? "text-brand" : "text-faint hover:text-ink")}>
                {b.icon}{b.label}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="grid place-items-center py-24">
      <div className="flex flex-col items-center gap-3">
        <span className="size-10 rounded-xl bg-navy text-gold grid place-items-center font-display font-extrabold animate-pulse-dot">K</span>
        <p className="text-sm text-sub font-medium">Loading…</p>
      </div>
    </div>
  );
}

export { Badge as ShellBadge, FileText as ShellFileIcon };
