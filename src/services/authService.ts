import { requireSupabaseConfigured, supabase } from "../lib/supabase";
import type { BusinessSettings } from "../data/mockData";

export interface Session {
  user: { name: string; email: string; phone: string };
  business: BusinessSettings & { id: string };
  signedInAt: string;
}

type AuthInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  businessType: string;
  region?: string;
};

const AUTH_CACHE_KEY = "kasabiz_auth_session";
const PENDING_ONBOARDING_KEY = "kasabiz_pending_onboarding";
const AUTH_TIMEOUT_MS = 10000;

async function withTimeout<T>(request: PromiseLike<T>, message: string): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

const cacheSession = (session: Session) => {
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
  return session;
};

const savePendingOnboarding = (data: AuthInput) => {
  localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(data));
};

const getPendingOnboarding = (): AuthInput | null => {
  const raw = localStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthInput;
  } catch {
    localStorage.removeItem(PENDING_ONBOARDING_KEY);
    return null;
  }
};

const clearPendingOnboarding = () => localStorage.removeItem(PENDING_ONBOARDING_KEY);

export function userAuthError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (/rate limit|email rate limit|over_email_send_rate_limit/i.test(message)) {
    return "Supabase has temporarily limited confirmation emails. Wait a while before trying again, or configure a custom SMTP provider in Supabase.";
  }
  if (/error sending confirmation email|error sending email|smtp|sender/i.test(message)) {
    return "Supabase could not send the confirmation email. Verify your Resend SMTP credentials and use a sender address from a verified Resend domain.";
  }
  return message || fallback;
}

const onboardingFromUser = (user: { email?: string; user_metadata?: Record<string, unknown> }): AuthInput | null => {
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const phone = typeof metadata.phone === "string" ? metadata.phone : "";
  const businessName = typeof metadata.business_name === "string" ? metadata.business_name : "";
  const businessType = typeof metadata.business_type === "string" ? metadata.business_type : "";
  const region = typeof metadata.region === "string" ? metadata.region : "";
  if (!user.email || !fullName || !phone || !businessName || !businessType) return null;
  return { fullName, email: user.email, phone, password: "", businessName, businessType, region };
};

const createBusinessForUser = async (data: AuthInput): Promise<void> => {
  const { data: existingMembership, error: membershipError } = await withTimeout(supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .eq("status", "active")
    .limit(1)
    .maybeSingle(), "Business setup timed out. Please try again.");
  if (membershipError) throw membershipError;
  if (existingMembership) {
    clearPendingOnboarding();
    return;
  }

  const { error } = await withTimeout(supabase.rpc("create_business", {
    business_name: data.businessName,
    business_type: data.businessType,
    business_region: data.region ?? "",
    member_name: data.fullName,
    member_phone: data.phone,
  }), "Business setup timed out. Please try again.");
  if (error) throw error;
  clearPendingOnboarding();
};

const sessionFromUser = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<Session> => {
  const { data: membership, error: membershipError } = await withTimeout(supabase
    .from("business_members")
    .select("business_id, display_name, phone, businesses(id, name, business_type, region)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle(), "Loading your business is taking too long. Check your connection and try again.");

  if (membershipError) throw membershipError;
  if (!membership?.businesses || Array.isArray(membership.businesses)) {
    throw new Error("Your account is not connected to a business yet.");
  }

  const business = membership.businesses as { id: string; name: string; business_type: string; region: string | null };
  return cacheSession({
    user: {
      name: membership.display_name,
      email: user.email ?? "",
      phone: membership.phone ?? "",
    },
    business: {
      id: business.id,
      name: business.name,
      type: business.business_type,
      region: business.region ?? "",
      phone: membership.phone ?? "",
      location: business.region ?? "",
      currency: "GHS",
    },
    signedInAt: new Date().toISOString(),
  });
};

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    requireSupabaseConfigured();
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), "Login timed out. Please check your connection and try again.");
    if (error || !data.user) throw error ?? new Error("Unable to sign in.");
    try {
      return await sessionFromUser(data.user);
    } catch (sessionError) {
      const pending = getPendingOnboarding() ?? onboardingFromUser(data.user);
      if (
        !(sessionError instanceof Error) ||
        sessionError.message !== "Your account is not connected to a business yet." ||
        !pending ||
        pending.email.trim().toLowerCase() !== (data.user.email ?? "").trim().toLowerCase()
      ) {
        throw sessionError;
      }
      await createBusinessForUser(pending);
      try {
        return await sessionFromUser(data.user);
      } catch {
        throw new Error("Your account was authenticated, but its business setup is incomplete. Please run the Supabase migrations, then try logging in again.");
      }
    }
  },

  async register(data: AuthInput): Promise<Session> {
    requireSupabaseConfigured();
    const { data: authData, error } = await withTimeout(supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/#/auth/callback?next=/pricing`,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          business_name: data.businessName,
          business_type: data.businessType,
          region: data.region ?? "",
        },
      },
    }), "Account creation timed out. Please check your connection and try again.");
    if (error || !authData.user) throw error ?? new Error("Unable to create your account.");

    if (!authData.session) {
      savePendingOnboarding(data);
      throw new Error("Account created. Check your email to confirm the account, then log in.");
    }

    await createBusinessForUser(data);
    const session = await sessionFromUser(authData.user);
    return session;
  },

  async loginWithGoogle(): Promise<void> {
    requireSupabaseConfigured();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/#/auth/callback` },
    });
    if (error) throw error;
  },

  async completeOAuthCallback(code: string): Promise<Session> {
    requireSupabaseConfigured();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    const session = await this.getCurrentSession();
    if (!session) throw new Error("Google sign-in did not return a session.");
    return session;
  },

  async requestPasswordReset(email: string): Promise<void> {
    requireSupabaseConfigured();
    const { error } = await withTimeout(supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    }), "Password reset timed out. Please try again.");
    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    requireSupabaseConfigured();
    const { error } = await withTimeout(supabase.auth.updateUser({ password }), "Password update timed out. Please try again.");
    if (error) throw error;
  },

  getSession(): Session | null {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
  },

  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return sessionFromUser(data.user);
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem(AUTH_CACHE_KEY);
  },
};
