import { supabase } from "../lib/supabase";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v2/inline.js";

type PaystackTransaction = {
  reference: string;
  status: string;
  transaction?: string;
  trans?: string;
};

type PaystackError = { message?: string };

type PaystackPop = {
  resumeTransaction: (accessCode: string) => void;
  newTransaction: (options: {
    key: string;
    email: string;
    amount: number;
    currency: "GHS";
    ref: string;
    metadata: { plan: string; billing: string; months: number };
    onSuccess: (transaction: PaystackTransaction) => void;
    onCancel: () => void;
    onError: (error: PaystackError) => void;
  }) => void;
};

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPop;
  }
}

export function isPaystackConfigured(): boolean {
  return Boolean(PAYSTACK_PUBLIC_KEY);
}

export function getPaystackPublicKey(): string {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY.");
  }
  return PAYSTACK_PUBLIC_KEY;
}

export function createPaystackReference(businessId: string): string {
  return `sika_${businessId}_${Date.now()}`;
}

export const PAYSTACK_PLAN = {
  name: "Business",
  firstMonthAmountGhs: 30,
  recurringAmountGhs: 60,
  currency: "GHS",
} as const;

async function loadPaystack(): Promise<PaystackPop> {
  if (window.PaystackPop) return new window.PaystackPop();
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Paystack checkout.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Paystack checkout."));
    document.head.appendChild(script);
  });
  const PaystackPopConstructor = (window as { PaystackPop?: new () => PaystackPop }).PaystackPop;
  if (!PaystackPopConstructor) throw new Error("Paystack checkout is unavailable.");
  return new PaystackPopConstructor();
}

export async function startPaystackCheckout(input: {
  email: string;
  businessId: string;
  months: number;
}): Promise<PaystackTransaction> {
  const checkout = await loadPaystack();
  const amountGhs = PAYSTACK_PLAN.firstMonthAmountGhs
    + Math.max(0, input.months - 1) * PAYSTACK_PLAN.recurringAmountGhs;
  return new Promise((resolve, reject) => {
    checkout.newTransaction({
      key: getPaystackPublicKey(),
      email: input.email,
      amount: amountGhs * 100,
      currency: PAYSTACK_PLAN.currency,
      ref: createPaystackReference(input.businessId),
      metadata: { plan: PAYSTACK_PLAN.name, billing: "monthly", months: input.months },
      onSuccess: (transaction) => resolve(transaction),
      onCancel: () => reject(new Error("Payment was cancelled.")),
      onError: (error) => reject(new Error(error.message || "Paystack could not load the payment checkout.")),
    });
  });
}

export async function verifyPaystackPayment(input: {
  reference: string;
  businessId: string;
  email: string;
  months: number;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ verified?: boolean; error?: string }>("verify-paystack-payment", { body: input });
  if (!error && data?.verified === true) return;
  if (!error && data?.error) throw new Error(data.error);
  if (!error) throw new Error("Payment verification failed.");

  const context = (error as { context?: unknown }).context;
  if (context instanceof Response) {
    const responseBody = await context.clone().json().catch(() => null) as { error?: string } | null;
    if (responseBody?.error) throw new Error(responseBody.error);
  }
  throw new Error(error.message || "Payment verification failed.");
}
