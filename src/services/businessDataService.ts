import { supabase } from "../lib/supabase";
import type { BusinessData, Customer, Expense, Movement, Product, Purchase, Sale, SaleItem, StaffMember } from "../data/mockData";

type Business = { id: string; name: string; business_type: string; region: string | null; phone: string | null; plan: BusinessData["plan"] };

const emptyData = (business: Business): BusinessData => ({
  products: [], customers: [], sales: [], expenses: [], purchases: [], movements: [],
  staff: [], heldSales: [], auditLogs: [], nextReceiptNo: 1,
  settings: {
    name: business.name, type: business.business_type, phone: business.phone ?? "",
    location: business.region ?? "", region: business.region ?? "", currency: "GHS (GH₵)",
  },
  plan: business.plan,
});

export async function loadBusinessData(businessId: string): Promise<BusinessData> {
  const [businessResult, productsResult, customersResult, salesResult, expensesResult, movementsResult, membersResult] = await Promise.all([
    supabase.from("businesses").select("id, name, business_type, region, phone, plan").eq("id", businessId).single(),
    supabase.from("products").select("*").eq("business_id", businessId).eq("active", true).order("name"),
    supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    supabase.from("sales").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("business_id", businessId).order("expense_date", { ascending: false }),
    supabase.from("stock_movements").select("*, products(name)").eq("business_id", businessId).order("created_at", { ascending: false }),
    supabase.from("business_members").select("*").eq("business_id", businessId).order("created_at"),
  ]);
  const failure = [businessResult, productsResult, customersResult, salesResult, expensesResult, movementsResult, membersResult].find((result) => result.error);
  if (failure?.error) throw failure.error;
  const business = businessResult.data as Business;
  const data = emptyData(business);

  const sales = salesResult.data ?? [];
  const saleIds = sales.map((sale) => sale.id);
  const [itemsResult, paymentsResult] = await Promise.all([
    saleIds.length ? supabase.from("sale_items").select("*").in("sale_id", saleIds) : Promise.resolve({ data: [], error: null }),
    saleIds.length ? supabase.from("payments").select("*").in("sale_id", saleIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (itemsResult.error) throw itemsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;

  const items = itemsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const products = productsResult.data ?? [];
  const customers = customersResult.data ?? [];
  const movements = movementsResult.data ?? [];

  data.products = products.map((row): Product => ({
    id: row.id, name: row.name, sku: row.sku ?? "", category: row.category ?? row.category_id ?? "",
    price: Number(row.price), cost: Number(row.cost), stock: Number(row.stock),
    minStock: Number(row.min_stock), supplier: row.supplier ?? "", unit: row.unit, updatedAt: row.updated_at,
  }));
  data.customers = customers.map((row): Customer => ({
    id: row.id, name: row.name, phone: row.phone ?? "", city: "", region: row.address ?? "",
    email: row.email ?? undefined, createdAt: row.created_at,
  }));
  data.sales = sales.map((row): Sale => {
    const saleItems = items.filter((item) => item.sale_id === row.id).map((item): SaleItem => ({
      productId: item.product_id, name: item.product_name, qty: Number(item.quantity),
      price: Number(item.unit_price), cost: Number(item.unit_cost),
    }));
    const salePayments = payments.filter((payment) => payment.sale_id === row.id).map((payment) => ({
      id: payment.id, amount: Number(payment.amount), method: payment.method, date: payment.created_at,
    }));
    return {
      id: row.id, receipt: row.receipt_number, receiptNo: Number(row.receipt_number.replace(/\D/g, "")) || 0,
      customerId: row.customer_id, customerName: row.customer_name, items: saleItems,
      subtotal: Number(row.subtotal), discount: Number(row.discount), total: Number(row.total),
      payments: salePayments, method: salePayments[0]?.method ?? "Credit", date: row.created_at,
      dueDate: row.due_date, cashier: row.cashier_id ?? "", voidedAt: row.voided_at ?? undefined,
      voidedBy: row.voided_by ?? undefined, voidReason: row.void_reason ?? undefined,
    };
  });
  data.expenses = (expensesResult.data ?? []).map((row): Expense => ({
    id: row.id, description: row.description, category: row.category, amount: Number(row.amount),
    method: "Other", date: row.expense_date,
  }));
  data.movements = movements.map((row): Movement => ({
    id: row.id, date: row.created_at, type: row.movement_type === "purchase" ? "Purchase" : row.movement_type === "sale" ? "Sale" : row.movement_type === "return" ? "Return" : "Adjustment",
    productId: row.product_id, productName: row.products?.name ?? "", qty: Number(row.quantity), note: row.note ?? "",
  }));
  data.staff = (membersResult.data ?? []).map((row): StaffMember => ({
    id: row.user_id, name: row.display_name, email: "", role: row.role === "owner" ? "Owner" : row.role === "manager" ? "Manager" : row.role === "cashier" ? "Cashier" : "Staff",
    status: row.status === "active" ? "Active" : row.status === "invited" ? "Invited" : "Suspended", lastActive: row.created_at,
  }));
  data.nextReceiptNo = data.sales.reduce((max, sale) => Math.max(max, sale.receiptNo), 0) + 1;
  return data;
}
