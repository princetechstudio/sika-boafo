import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, KenteBar } from "../../components/ui";
import { authService } from "../../services/authService";

function getCallbackParams() {
  const hash = window.location.hash;
  const queryStart = hash.indexOf("?");
  return new URLSearchParams(queryStart === -1 ? "" : hash.slice(queryStart + 1));
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const completeSignIn = async () => {
      try {
        const params = getCallbackParams();
        const callbackError = params.get("error_description") ?? params.get("error");
        if (callbackError) throw new Error(callbackError);

        const code = params.get("code");
        if (code) {
          await authService.completeOAuthCallback(code);
        } else if (!authService.getSession()) {
          await authService.getCurrentSession();
        }

        if (!authService.getSession()) {
          throw new Error("Google sign-in did not return a valid session.");
        }
        const next = params.get("next");
        navigate(next === "/pricing" ? "/pricing" : "/dashboard", { replace: true });
      } catch (callbackError) {
        if (active) {
          setError(callbackError instanceof Error ? callbackError.message : "Unable to complete Google sign-in.");
        }
      }
    };

    void completeSignIn();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-paper grid place-items-center px-6">
      <div className="text-center max-w-md animate-fade-up">
        <KenteBar className="w-24 mx-auto mb-6" />
        {error ? (
          <>
            <h1 className="font-display font-bold text-xl text-ink">Google sign-in failed</h1>
            <p className="text-sub text-sm mt-2">{error}</p>
            <Link to="/login">
              <Button className="mt-6">Back to login</Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display font-bold text-xl text-ink">Signing you in</h1>
            <p className="text-sub text-sm mt-2">Please wait while we finish connecting your Google account.</p>
            <span className="inline-block size-8 rounded-full border-2 border-brand border-t-transparent animate-spin mt-6" />
          </>
        )}
      </div>
    </div>
  );
}
