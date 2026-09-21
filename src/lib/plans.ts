import type { BusinessData } from "../data/mockData";

export const PLAN_LIMITS = {
  Free: { products: 50, monthlySales: 200, staff: 1 },
  Pro: { products: Number.POSITIVE_INFINITY, monthlySales: Number.POSITIVE_INFINITY, staff: 3 },
  Business: { products: Number.POSITIVE_INFINITY, monthlySales: Number.POSITIVE_INFINITY, staff: Number.POSITIVE_INFINITY },
} as const;

export type PaidFeature = "csvExport" | "smsReminders" | "staffManagement" | "roles";

export function planLimit(plan: BusinessData["plan"], resource: keyof typeof PLAN_LIMITS.Free) {
  return PLAN_LIMITS[plan][resource];
}

export function hasPaidFeature(plan: BusinessData["plan"], feature: PaidFeature) {
  if (plan === "Business") return true;
  return plan === "Pro" && (feature === "csvExport" || feature === "smsReminders");
}
