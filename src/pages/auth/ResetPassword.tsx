import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Button, Field, Input } from "../../components/ui";
import { authService } from "../../services/authService";
import { isStrongPassword, passwordRequirements } from "../../lib/password";
import AuthFrame from "./AuthFrame";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const prepareRecovery = async () => {
      try {
        const hash = window.location.hash;
        const tokenStart = hash.indexOf("access_token=");
        if (tokenStart !== -1) {
          const tokenParams = new URLSearchParams(hash.slice(tokenStart));
          const accessToken = tokenParams.get("access_token");
          const refreshToken = tokenParams.get("refresh_token");
          if (!accessToken || !refreshToken) throw new Error("The password reset link is incomplete.");
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        }
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("This reset link is missing or has expired. Request a new link.");
        if (active) setReady(true);
      } catch (recoveryError) {
        if (active) {
          setError(recoveryError instanceof Error ? recoveryError.message : "Unable to open the password reset link.");
          setReady(false);
        }
      }
    };
    void prepareRecovery();
    return () => { active = false; };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isStrongPassword(password)) {
      setError(passwordRequirements);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.updatePassword(password);
      setSaved(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <h1 className="font-display font-extrabold text-[28px] text-ink">Set a new password</h1>
      <p className="text-sub text-sm mt-1.5">Choose a strong password for your account.</p>
      {error && <div role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">{error}</div>}
      {!ready && !error ? (
        <div className="mt-6 rounded-lg border border-brand/20 bg-brand-soft px-3.5 py-3 text-sm text-sub">Checking your reset link...</div>
      ) : saved ? (
        <div role="status" className="mt-6 rounded-lg border border-ok/30 bg-ok-soft px-3.5 py-3 text-sm text-ok">
          Password updated. Redirecting you to login…
        </div>
      ) : ready ? (
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Field label="New password" hint={passwordRequirements}>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-faint" />
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-9" autoComplete="new-password" />
            </div>
          </Field>
          <Field label="Confirm new password">
            <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={busy}>Update password</Button>
        </form>
      ) : null}
      <p className="text-center text-sm text-sub mt-6"><Link to="/login" className="font-bold text-brand hover:text-brand-deep">Back to login</Link></p>
    </AuthFrame>
  );
}
