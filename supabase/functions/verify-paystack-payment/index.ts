import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PaymentRequest = {
  reference: string;
  businessId: string;
  email: string;
  months: number;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !paystackSecretKey) {
    return json({ error: "Payment verification is not configured. Set the Supabase function secrets and deploy again." }, 500);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid authentication" }, 401);

  let payload: PaymentRequest;
  try {
    payload = await request.json() as PaymentRequest;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!payload.reference || !payload.businessId || !payload.email) {
    return json({ error: "reference, businessId and email are required" }, 400);
  }
  if (!Number.isInteger(payload.months) || payload.months < 1 || payload.months > 12) {
    return json({ error: "Choose between 1 and 12 months" }, 400);
  }
  if (payload.email.trim().toLowerCase() !== (userData.user.email ?? "").trim().toLowerCase()) {
    return json({ error: "Payment email does not match the signed-in account" }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: membership, error: membershipError } = await admin
    .from("business_members")
    .select("business_id")
    .eq("business_id", payload.businessId)
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .maybeSingle();
  if (membershipError) return json({ error: membershipError.message }, 500);
  if (!membership) return json({ error: "You do not have access to this business" }, 403);

  const existing = await admin
    .from("payment_transactions")
    .select("status")
    .eq("reference", payload.reference)
    .maybeSingle();
  if (existing.error) return json({ error: existing.error.message }, 500);
  if (existing.data?.status === "success") return json({ verified: true, status: "success" });

  const paystackResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(payload.reference)}`,
    { headers: { Authorization: `Bearer ${paystackSecretKey}` } },
  );
  const paystackBody = await paystackResponse.json().catch(() => null);
  const transaction = paystackBody?.data;
  const expectedAmount = 3000 + (payload.months - 1) * 6000;
  const valid = paystackResponse.ok
    && paystackBody?.status === true
    && transaction?.status === "success"
    && transaction?.currency === "GHS"
    && Number(transaction?.amount) === expectedAmount
    && String(transaction?.customer?.email ?? "").toLowerCase() === String(userData.user.email ?? "").toLowerCase()
    && transaction?.metadata?.plan === "Business"
    && Number(transaction?.metadata?.months) === payload.months;

  const transactionRecord = {
    business_id: payload.businessId,
    user_id: userData.user.id,
    reference: payload.reference,
    transaction_id: transaction?.id ? String(transaction.id) : null,
    amount: expectedAmount / 100,
    currency: "GHS",
    plan: "Business",
    billing: "monthly",
    status: valid ? "success" : "failed",
  };
  const { error: recordError } = await admin
    .from("payment_transactions")
    .upsert(transactionRecord, { onConflict: "reference" });
  if (recordError) return json({ error: recordError.message }, 500);
  if (!valid) {
    const reason = typeof paystackBody?.message === "string" ? paystackBody.message : "Paystack could not verify this payment";
    return json({ verified: false, error: reason });
  }

  const { error: activationError } = await admin
    .from("businesses")
    .update({ plan: "Business" })
    .eq("id", payload.businessId);
  if (activationError) return json({ error: activationError.message }, 500);

  return json({ verified: true, status: "success" });
});
