/** Registration backed by Supabase Auth and the business onboarding RPC. */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, UserRoundPlus } from "lucide-react";
import { Button, Field, Input, Select } from "../../components/ui";
import { BUSINESS_TYPES, GH_REGIONS } from "../../data/mockData";
import { authService, userAuthError } from "../../services/authService";
import { useApp } from "../../state/store";
import { cx } from "../../lib/format";
import AuthFrame from "./AuthFrame";
import { isStrongPassword, passwordRequirements } from "../../lib/password";

type Errors = Partial<Record<"fullName" | "email" | "phone" | "password" | "businessName" | "businessType" | "terms", string>>;

export default function Register() {
  const nav = useNavigate();
  const { toast, dispatch } = useApp();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [f, setF] = useState({
    fullName: "", email: "", phone: "", password: "",
    businessName: "", businessType: "", region: "Greater Accra", terms: false,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (f.fullName.trim().length < 2) errs.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Enter a valid email address.";
    if (!/^0\d{2}\s?\d{3}\s?\d{4}$/.test(f.phone.trim())) errs.phone = "Use a Ghana number, e.g. 024 555 0182.";
    if (!isStrongPassword(f.password)) errs.password = passwordRequirements;
    if (f.businessName.trim().length < 2) errs.businessName = "Enter your business name.";
    if (!f.businessType) errs.businessType = "Pick the closest match.";
    if (!f.terms) errs.terms = "Please accept to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setAuthError(null);
    setConfirmationMessage(null);
    try {
      const session = await authService.register({
        fullName: f.fullName.trim(), email: f.email.trim(), phone: f.phone.trim(),
        password: f.password,
        businessName: f.businessName.trim(), businessType: f.businessType,
        region: f.region,
      });
      dispatch({ type: "SETTINGS_UPDATE", settings: session.business });
      toast("Akwaaba! Choose a business plan to continue.", "success");
      nav("/pricing", { replace: true });
    } catch (error) {
      const message = userAuthError(error, "Unable to create your account.");
      if (message.startsWith("Account created.")) {
        setConfirmationMessage(`${message} After confirmation, you will be taken to Business Plans.`);
        toast("Check your email to confirm your account.", "success");
      } else {
        setAuthError(message);
        toast(message, "error");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <h1 className="font-display font-extrabold text-[28px] text-ink">Create your account</h1>
      <p className="text-sub text-sm mt-1.5">Set up your business in about two minutes.</p>
      {authError && (
        <div role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {authError}
        </div>
      )}
      {confirmationMessage && (
        <div role="status" className="mt-4 rounded-lg border border-ok/30 bg-ok-soft px-3.5 py-3 text-sm text-ok">
          {confirmationMessage}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" error={errors.fullName}>
          <Input value={f.fullName} invalid={!!errors.fullName} placeholder="Ama Serwaa Mensah"
            onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" error={errors.email}>
            <Input type="email" value={f.email} invalid={!!errors.email} placeholder="you@business.com"
              onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input value={f.phone} invalid={!!errors.phone} placeholder="024 555 0182"
              onChange={(e) => set("phone", e.target.value)} inputMode="tel" autoComplete="tel" />
          </Field>
        </div>
        <Field label="Password" error={errors.password} hint={!errors.password ? passwordRequirements : undefined}>
          <Input type="password" value={f.password} invalid={!!errors.password} placeholder="••••••••"
            onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name" error={errors.businessName}>
            <Input value={f.businessName} invalid={!!errors.businessName} placeholder="Serwaa Fashion Hub"
              onChange={(e) => set("businessName", e.target.value)} />
          </Field>
          <Field label="Business type" error={errors.businessType}>
            <Select value={f.businessType} invalid={!!errors.businessType} onChange={(e) => set("businessType", e.target.value)}>
              <option value="" disabled>Select type…</option>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Region">
          <Select value={f.region} onChange={(e) => set("region", e.target.value)}>
            {GH_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>

        <label className={cx("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 cursor-pointer transition",
          f.terms ? "border-ok/40 bg-ok-soft" : errors.terms ? "border-danger bg-danger-soft" : "border-line bg-card2")}>
          <input type="checkbox" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 size-4 accent-[#0e9f6e]" />
          <span className="text-[13px] text-sub leading-relaxed">
            I agree to the{" "}
            <Link
              to="/terms"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-brand underline underline-offset-2 hover:text-brand-deep"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-brand underline underline-offset-2 hover:text-brand-deep"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && <p className="text-xs font-medium text-danger -mt-2">{errors.terms}</p>}

        <Button type="submit" size="lg" className="w-full" loading={busy}>
          <UserRoundPlus className="size-4" /> Create account & start selling
        </Button>

        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 pt-1">
          {["Secure payment after setup", "Pay in cedis", "Set up in minutes"].map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-xs font-semibold text-sub"><Check className="size-3.5 text-ok" /> {t}</li>
          ))}
        </ul>
      </form>

      <p className="text-center text-sm text-sub mt-6">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-brand hover:text-brand-deep underline underline-offset-4">Login</Link>
      </p>
    </AuthFrame>
  );
}
