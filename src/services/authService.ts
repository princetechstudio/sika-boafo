import { requireSupabaseConfigured, supabase } from "../lib/supabase";
import type { BusinessSettings } from "../data/mockData";

export interface Session {
  user: { name: string; email: string; phone: string };
  business: BusinessSettings & { id: string };
  signedInAt: string;
}

export interface BusinessMembership {
  id: string;
  name: string;
  type: string;
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
export const BUSINESS_CHANGED_EVENT = "kasabiz-business-changed";

type BusinessRow = {
  id: string;
  name: string;
  business_type: string;
  region: string | null;
};

type MembershipRow = {
  business_id: string;
  display_name: string;
  phone: string | null;
  businesses: BusinessRow | null;
};

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

const membershipsForUser = async (userId: string): Promise<MembershipRow[]> => {
  const { data, error } = await withTimeout(supabase
    .from("business_members")
    .select("business_id, display_name, phone, businesses(id, name, business_type, region)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at"), "Loading your businesses is taking too long. Check your connection and try again.");

  if (error) throw error;
  return (data ?? []).map((membership) => ({
    business_id: membership.business_id,
    display_name: membership.display_name,
    phone: membership.phone,
    businesses: Array.isArray(membership.businesses)
      ? membership.businesses[0] ?? null
      : membership.businesses,
  }));
};

const sessionForMembership = (
  user: { email?: string },
  membership: MembershipRow,
): Session => {
  const business = membership.businesses;
  if (!business) {
    throw new Error("Your account is not connected to a business yet.");
  }

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

const sessionFromUser = async (
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  preferredBusinessId?: string,
): Promise<Session> => {
  const memberships = await membershipsForUser(user.id);
  const cached = authService.getSession();
  const selectedId = preferredBusinessId ??
    (cached && cached.user.email.toLowerCase() === user.email?.toLowerCase() ? cached.business.id : undefined);
  const membership = memberships.find((item) => item.business_id === selectedId) ?? memberships[0];
  if (!membership) {
    throw new Error("Your account is not connected to a business yet.");
  }
  return sessionForMembership(user, membership);
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

  async getBusinesses(): Promise<BusinessMembership[]> {
    requireSupabaseConfigured();
    const { data: authData, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      "Loading your account is taking too long. Please try again.",
    );
    if (authError) throw authError;
    if (!authData.user) throw new Error("You must be signed in to load your businesses.");

    const memberships = await membershipsForUser(authData.user.id);
    return memberships.flatMap((membership) => {
      if (!membership.businesses) return [];
      return [{
        id: membership.business_id,
        name: membership.businesses.name,
        type: membership.businesses.business_type,
      }];
    });
  },

  async switchBusiness(businessId: string): Promise<Session> {
    requireSupabaseConfigured();
    const { data: authData, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      "Loading your account is taking too long. Please try again.",
    );
    if (authError) throw authError;
    if (!authData.user) throw new Error("You must be signed in to switch businesses.");

    const memberships = await membershipsForUser(authData.user.id);
    const membership = memberships.find((item) => item.business_id === businessId);
    if (!membership) throw new Error("You do not have access to that business.");

    const session = sessionForMembership(authData.user, membership);
    window.dispatchEvent(new Event(BUSINESS_CHANGED_EVENT));
    return session;
  },

  async createBusiness(input: Omit<AuthInput, "email" | "password">): Promise<Session> {
    requireSupabaseConfigured();
    const { data: authData, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      "Loading your account is taking too long. Please try again.",
    );
    if (authError) throw authError;
    if (!authData.user) throw new Error("You must be signed in to create a business.");

    const businessName = input.businessName.trim();
    const memberName = input.fullName.trim();
    if (businessName.length < 2) throw new Error("Business name must be at least 2 characters.");
    if (memberName.length < 2) throw new Error("Your name must be at least 2 characters.");

    const { data: businessId, error } = await withTimeout(
      supabase.rpc("create_business", {
        business_name: businessName,
        business_type: input.businessType,
        business_region: input.region ?? "",
        member_name: memberName,
        member_phone: input.phone.trim(),
      }),
      "Business creation timed out. Please try again.",
    );
    if (error) throw error;
    if (!businessId) throw new Error("The business was created but could not be selected.");

    const session = await sessionFromUser(authData.user, businessId);
    window.dispatchEvent(new Event(BUSINESS_CHANGED_EVENT));
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
