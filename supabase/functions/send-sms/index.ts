import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SmsRequest = {
  businessId: string;
  recipient: string;
  message: string;
  template?: string;
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
  const arkeselApiKey = Deno.env.get("ARKESEL_API_KEY");
  const senderId = Deno.env.get("ARKESEL_SENDER_ID");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !arkeselApiKey || !senderId) {
    return json({ error: "SMS service is not configured" }, 500);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid authentication" }, 401);

  let payload: SmsRequest;
  try {
    payload = await request.json() as SmsRequest;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!payload.businessId || !payload.recipient || !payload.message.trim()) {
    return json({ error: "businessId, recipient and message are required" }, 400);
  }
  if (payload.message.length > 480) return json({ error: "SMS message is too long" }, 400);
  const recipient = payload.recipient.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const normalizedRecipient = recipient.startsWith("0") ? `233${recipient.slice(1)}` : recipient;

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

  const { data: queued, error: queueError } = await admin
    .from("message_queue")
    .insert({
      business_id: payload.businessId,
      recipient: payload.recipient,
      channel: "sms",
      template: payload.template ?? "transactional",
      body: payload.message.trim(),
      status: "sending",
      attempts: 1,
    })
    .select("id")
    .single();
  if (queueError) return json({ error: queueError.message }, 500);

  try {
    const arkeselUrl = new URL("https://sms.arkesel.com/sms/api");
    arkeselUrl.search = new URLSearchParams({
      action: "send-sms",
      api_key: arkeselApiKey,
      to: normalizedRecipient,
      from: senderId,
      sms: payload.message.trim(),
    }).toString();

    const arkeselResponse = await fetch(arkeselUrl, { method: "GET" });
    const responseText = await arkeselResponse.text();
    let responseBody: unknown = responseText;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      // Arkesel may return a plain-text status code or message.
    }
    if (!arkeselResponse.ok) {
      throw new Error(typeof responseBody === "string" && responseBody ? responseBody : "Arkesel rejected the SMS");
    }

    const providerMessageId =
      typeof responseBody === "object" && responseBody !== null
        ? ("data" in responseBody && typeof responseBody.data === "object" && responseBody.data !== null && "message_id" in responseBody.data
          ? String(responseBody.data.message_id)
          : "message_id" in responseBody
            ? String(responseBody.message_id)
            : null)
        : null;
    await admin.from("message_queue").update({
      status: "sent",
      provider_message_id: providerMessageId,
      sent_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", queued.id);

    return json({ queuedId: queued.id, status: "sent", providerMessageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMS delivery failed";
    await admin.from("message_queue").update({
      status: "failed",
      error_message: message,
    }).eq("id", queued.id);
    return json({ queuedId: queued.id, status: "failed", error: message });
  }
});
