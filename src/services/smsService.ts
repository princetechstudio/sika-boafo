import { supabase } from "../lib/supabase";

export async function sendSms(input: {
  businessId: string;
  recipient: string;
  message: string;
  template?: string;
}) {
  const { data, error } = await supabase.functions.invoke("send-sms", { body: input });
  if (error) {
    if (error.name === "FunctionsFetchError") {
      throw new Error(
        "SMS service is not available. Deploy the Supabase send-sms function and configure the Arkesel credentials."
      );
    }
    throw error;
  }
  if (!data || data.status === "failed") throw new Error(data?.error ?? "SMS delivery failed.");
  return data as { queuedId: string; status: "sent"; providerMessageId: string | null };
}
