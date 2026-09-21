import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalized = (value: string) => value.trim().toLowerCase();

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmails = (Deno.env.get("ADMIN_EMAILS") ?? Deno.env.get("ADMIN_EMAIL") ?? "")
    .split(",")
    .map(normalized)
    .filter(Boolean);
  if (!supabaseUrl || !anonKey || !serviceRoleKey || adminEmails.length === 0) {
    return json({ error: "Admin dashboard is not configured." }, 500);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const email = normalized(userData.user?.email ?? "");
  if (userError || !userData.user || !adminEmails.includes(email)) {
    return json({ error: "Administrator access required" }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const [businessesResult, membersResult, paymentsResult, usersResult] = await Promise.all([
    admin.from("businesses")
      .select("id, name, business_type, region, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("business_members").select("business_id, user_id, role, display_name, status"),
    admin.from("payment_transactions")
      .select("business_id, reference, amount, currency, status, created_at, businesses(name)")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const firstError = businessesResult.error ?? membersResult.error ?? paymentsResult.error ?? usersResult.error;
  if (firstError) return json({ error: firstError.message }, 500);

  const businesses = businessesResult.data ?? [];
  const members = membersResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const successfulPayments = payments.filter((payment) => payment.status === "success");
  const businessMembers = new Map<string, number>();
  for (const member of members) {
    if (member.status === "active") businessMembers.set(member.business_id, (businessMembers.get(member.business_id) ?? 0) + 1);
  }

  return json({
    generatedAt: new Date().toISOString(),
    summary: {
      businesses: businesses.length,
      paidBusinesses: businesses.filter((business) => business.plan === "Business").length,
      unpaidBusinesses: businesses.filter((business) => business.plan !== "Business").length,
      users: usersResult.data.users.length,
      activeMembers: members.filter((member) => member.status === "active").length,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter((payment) => payment.status === "failed").length,
      revenue: successfulPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
    },
    businesses: businesses.map((business) => ({
      ...business,
      members: businessMembers.get(business.id) ?? 0,
    })),
    payments,
  });
});
