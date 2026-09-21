/**
 * KasaBiz — app entry. HashRouter keeps every route working when the built
 * site is served statically. Dashboard routes are guarded by Supabase Auth.
 */
import React, { Suspense } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import { AppProvider } from "./state/store";
import { useApp } from "./state/store";
import { authService } from "./services/authService";
import PublicLayout from "./components/layout/PublicLayout";
import AppShell, { ToastHost } from "./components/layout/AppShell";
import { Button, KenteBar } from "./components/ui";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OAuthCallback from "./pages/auth/OAuthCallback";
import ResetPassword from "./pages/auth/ResetPassword";

const Landing = React.lazy(() => import("./pages/public/Landing"));
const Pricing = React.lazy(() => import("./pages/public/Pricing"));
const Features = React.lazy(() => import("./pages/public/Features"));
const HowItWorks = React.lazy(() => import("./pages/public/HowItWorks"));
const FAQ = React.lazy(() => import("./pages/public/FAQ"));
const Solutions = React.lazy(() => import("./pages/public/Solutions"));
const Stories = React.lazy(() => import("./pages/public/Stories"));
const Legal = React.lazy(() => import("./pages/public/Legal"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Products = React.lazy(() => import("./pages/Products"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Sales = React.lazy(() => import("./pages/Sales"));
const NewSale = React.lazy(() => import("./pages/NewSale"));
const Customers = React.lazy(() => import("./pages/Customers"));
const Debtors = React.lazy(() => import("./pages/Debtors"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const Purchases = React.lazy(() => import("./pages/Purchases"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Receipts = React.lazy(() => import("./pages/Receipts"));
const Staff = React.lazy(() => import("./pages/Staff"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Admin = React.lazy(() => import("./pages/Admin"));
const CeoDashboard = React.lazy(() => import("./pages/CeoDashboard"));

function Protected({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  if (!authService.getSession()) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function PaidDashboard() {
  const { data, dataLoading } = useApp();
  const email = authService.getSession()?.user.email?.trim().toLowerCase();
  const paymentBypass = email === "princetechstudio@gmail.com";
  if (dataLoading) return <Fallback />;
  if (data.plan !== "Business" && !paymentBypass) return <Navigate to="/pricing" replace />;
  return <Dashboard />;
}

function DeveloperOnly() {
  const email = authService.getSession()?.user.email.trim().toLowerCase();
  const allowed = (import.meta.env.VITE_DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!email || !allowed.includes(email)) return <NotFound />;
  return <Admin />;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-paper grid place-items-center px-6">
      <div className="text-center max-w-md animate-fade-up">
        <KenteBar className="w-24 mx-auto mb-6" />
        <p className="font-display font-extrabold text-7xl text-navy">404</p>
        <h1 className="font-display font-bold text-xl text-ink mt-3">This page took a trotro detour</h1>
        <p className="text-sub text-sm mt-2">The page you're looking for doesn't exist. Let's get you back on track.</p>
        <div className="flex justify-center gap-2 mt-6">
          <Link to="/"><Button variant="secondary">Go Home</Button></Link>
          <Link to="/dashboard"><Button>Open Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}

const Fallback = () => (
  <div className="min-h-[60vh] grid place-items-center">
    <div className="text-center">
      <img src="/logo.png" alt="Sika Boafo" className="size-14 mx-auto rounded-2xl object-contain animate-pulse" />
      <p className="text-sm text-sub mt-3">Loading...</p>
    </div>
  </div>
);

class RouteLoadBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (/dynamically imported module|importing a module script failed|failed to fetch/i.test(message)) {
      return { failed: true };
    }
    throw error;
  }

  componentDidMount() {
    sessionStorage.removeItem("sikaboafo-route-retry");
  }

  componentDidCatch() {
    const retryKey = "sikaboafo-route-retry";
    if (!sessionStorage.getItem(retryKey)) {
      sessionStorage.setItem(retryKey, "1");
      window.location.reload();
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen bg-paper grid place-items-center px-6">
        <div className="text-center max-w-md">
          <img src="/logo.png" alt="Sika Boafo" className="size-14 mx-auto rounded-2xl object-contain" />
          <h1 className="font-display font-bold text-xl text-ink mt-4">Updating the app</h1>
          <p className="text-sub text-sm mt-2">The latest version is being loaded. Please try again.</p>
          <button
            type="button"
            className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              sessionStorage.removeItem("sikaboafo-route-retry");
              window.location.reload();
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <RouteLoadBoundary>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/solutions/:type" element={<Solutions />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/privacy" element={<Legal kind="privacy" />} />
                <Route path="/terms" element={<Legal kind="terms" />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<DeveloperOnly />} />

              <Route element={<Protected><AppShell /></Protected>}>
                <Route path="/dashboard" element={<PaidDashboard />} />
                <Route path="/ceo" element={<CeoDashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/sales/new" element={<NewSale />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/debtors" element={<Debtors />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteLoadBoundary>
        <ToastHost />
      </HashRouter>
    </AppProvider>
  );
}
