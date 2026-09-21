/** Login form backed by the configured authentication service. */
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LogIn, Mail, Lock, Smartphone } from "lucide-react";
import { Badge, Button, Field, Input, KenteBar, Modal } from "../../components/ui";
import { Logo } from "../../components/layout/AppShell";
import { authService, userAuthError } from "../../services/authService";
import AuthFrame from "./AuthFrame";
import { useApp } from "../../state/store";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"login" | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useApp();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy("login");
    setAuthError(null);
    try {
      await authService.login(email, password);
      nav(loc.state?.from ?? "/dashboard", { replace: true });
    } catch (error) {
      const message = userAuthError(error, "Unable to log in. Please try again.");
      setAuthError(message);
      toast(message, "error");
    } finally {
      setBusy(null);
    }
  };

  const sendResetLink = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast("Enter a valid email address.", "error");
      return;
    }
    setResetBusy(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setResetSent(true);
      toast("If that account exists, a reset link is on its way.", "success");
    } catch (error) {
      const message = userAuthError(error, "Unable to send the reset link.");
      toast(message, "error");
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <AuthFrame>
      <h1 className="font-display font-extrabold text-[28px] text-ink">Welcome back</h1>
      <p className="text-sub text-sm mt-1.5">Sign in to your business dashboard.</p>
      {authError && (
        <div role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {authError}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-faint" />
            <Input type="email" value={email} invalid={!!errors.email} placeholder="you@business.com"
              className="pl-9" onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-faint" />
            <Input type={show ? "text" : "password"} value={password} invalid={!!errors.password}
              placeholder="••••••••" className="pl-9 pr-10"
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-faint hover:text-ink transition">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-sub font-medium cursor-pointer select-none">
            <input type="checkbox" defaultChecked className="size-4 accent-[#1d5bd6]" /> Keep me signed in
          </label>
          <button type="button" onClick={() => { setResetOpen(true); setResetSent(false); }} className="font-bold text-brand hover:text-brand-deep transition">
            Forgot password?
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy === "login"}>
          <LogIn className="size-4" /> Login
        </Button>
      </form>

      <p className="text-center text-sm text-sub mt-6">
        New to Sika Boafo?{" "}
        <Link to="/register" className="font-bold text-brand hover:text-brand-deep underline underline-offset-4">Create an account</Link>
      </p>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset password" sub="We'll email you a reset link."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Close</Button>
        <Button onClick={() => void sendResetLink()} loading={resetBusy} disabled={resetSent}>{resetSent ? "Link sent" : "Send reset link"}</Button>
          </>
        }>
        {resetSent ? (
          <div className="flex items-start gap-3 rounded-lg bg-ok-soft border border-ok/25 px-4 py-3">
            <Badge tone="ok">Sent</Badge>
            <p className="text-sm text-ink/80">If <b>{email}</b> exists, a reset link is on its way.</p>
          </div>
        ) : (
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        )}
      </Modal>
    </AuthFrame>
  );
}

export function GoogleG() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5L1.3 17.4C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.1 14.4c-.3-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.3 6.6C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.8-3z" />
      <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.8 3c1-2.9 3.7-4.9 6.9-4.9z" />
    </svg>
  );
}

export { ArrowLeft, Smartphone, KenteBar };
