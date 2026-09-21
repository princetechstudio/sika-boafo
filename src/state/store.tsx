/**
 * Global app store — React context + reducer, persisted to localStorage.
 * All mutations a real backend would own live here as actions; swapping in
 * an API later means dispatching the same actions after the request resolves.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type {
  BusinessData, BusinessSettings, Customer, Expense, HeldSale, Movement,
  Product, Purchase, Sale, SaleItem, StaffMember, AuditLog,
} from "../data/mockData";
import { uid } from "../lib/format";
import { authService } from "../services/authService";
import { loadBusinessData } from "../services/businessDataService";
import { supabase } from "../lib/supabase";

const databasePaymentMethod = (method: string) => {
  if (method === "MTN Mobile Money") return "MTN MoMo";
  if (method === "Bank Transfer") return "Other";
  return method;
};

/* --------------------------------- types ---------------------------------- */

export interface Toast {
  id: string;
  message: string;
  tone: "success" | "error" | "info" | "warning";
}

interface State {
  data: BusinessData;
  toasts: Toast[];
}

export interface CompleteSaleInput {
  items: SaleItem[];
  customerId: string | null;
  customerName: string;
  discount: number;
  method: string;
  amountPaid: number;
  dueDate: string | null;
  cashier: string;
}

type Action =
  | { type: "PRODUCT_SAVE"; product: Product }
  | { type: "PRODUCT_DELETE"; id: string }
  | { type: "SALE_COMPLETE"; input: CompleteSaleInput; sale: Sale }
  | { type: "SALE_VOID"; saleId: string; actor: string; reason: string; date: string }
  | { type: "PAYMENT_RECORD"; saleId: string; amount: number; method: string; date: string }
  | { type: "CUSTOMER_SAVE"; customer: Customer }
  | { type: "CUSTOMER_DELETE"; id: string }
  | { type: "EXPENSE_SAVE"; expense: Expense }
  | { type: "EXPENSE_DELETE"; id: string }
  | { type: "PURCHASE_ADD"; purchase: Purchase }
  | { type: "STAFF_SAVE"; member: StaffMember }
  | { type: "STAFF_STATUS"; id: string; status: StaffMember["status"] }
  | { type: "MOVEMENT_ADD"; movement: Movement }
  | { type: "HELD_SAVE"; held: HeldSale }
  | { type: "HELD_REMOVE"; id: string }
  | { type: "SETTINGS_UPDATE"; settings: BusinessSettings }
  | { type: "PLAN_CONFIRMED"; plan: BusinessData["plan"] }
  | { type: "DATA_RESET" }
  | { type: "DATA_LOAD"; data: BusinessData }
  | { type: "TOAST_PUSH"; toast: Toast }
  | { type: "TOAST_REMOVE"; id: string };

/* -------------------------------- reducer --------------------------------- */

function reducer(state: State, action: Action): State {
  const d = state.data;
  switch (action.type) {
    case "PRODUCT_SAVE": {
      const exists = d.products.some((p) => p.id === action.product.id);
      const products = exists
        ? d.products.map((p) => (p.id === action.product.id ? { ...action.product, updatedAt: new Date().toISOString() } : p))
        : [{ ...action.product, updatedAt: new Date().toISOString() }, ...d.products];
      return { ...state, data: { ...d, products } };
    }
    case "PRODUCT_DELETE":
      return { ...state, data: { ...d, products: d.products.filter((p) => p.id !== action.id) } };

    case "SALE_COMPLETE": {
      const { input, sale } = action;
      // decrement stock + record movements
      let products = d.products;
      const movements: Movement[] = [];
      input.items.forEach((it) => {
        products = products.map((p) =>
          p.id === it.productId ? { ...p, stock: Math.max(0, p.stock - it.qty), updatedAt: new Date().toISOString() } : p
        );
        movements.push({
          id: uid("mv"), date: sale.date, type: "Sale", productId: it.productId,
          productName: it.name, qty: -it.qty, note: `Receipt ${sale.receipt}`,
        });
      });
      return {
        ...state,
        data: {
          ...d, products,
          sales: [sale, ...d.sales],
          movements: [...movements, ...d.movements],
          nextReceiptNo: d.nextReceiptNo + 1,
        },
      };
    }

    case "PAYMENT_RECORD": {
      const sales = d.sales.map((s) =>
        s.id === action.saleId
          ? { ...s, payments: [...s.payments, { id: uid("pay"), amount: action.amount, method: action.method, date: action.date }] }
          : s
      );
      return { ...state, data: { ...d, sales } };
    }

    case "SALE_VOID": {
      const sale = d.sales.find((s) => s.id === action.saleId);
      if (!sale || sale.voidedAt) return state;
      const products = d.products.map((product) => {
        const item = sale.items.find((entry) => entry.productId === product.id);
        return item ? { ...product, stock: product.stock + item.qty, updatedAt: new Date().toISOString() } : product;
      });
      const movements: Movement[] = sale.items.map((item) => ({
        id: uid("mv"), date: action.date, type: "Return", productId: item.productId,
        productName: item.name, qty: item.qty, note: `Voided sale ${sale.receipt}`,
      }));
      const audit: AuditLog = {
        id: uid("audit"), action: "Sale voided", entityId: sale.id, entityLabel: `Receipt #${sale.receipt}`,
        actor: action.actor, reason: action.reason, date: action.date,
      };
      return {
        ...state,
        data: {
          ...d,
          products,
          sales: d.sales.map((entry) => entry.id === sale.id ? { ...entry, voidedAt: action.date, voidedBy: action.actor, voidReason: action.reason } : entry),
          movements: [...movements, ...d.movements],
          auditLogs: [audit, ...(d.auditLogs ?? [])],
        },
      };
    }

    case "CUSTOMER_SAVE": {
      const exists = d.customers.some((c) => c.id === action.customer.id);
      const customers = exists
        ? d.customers.map((c) => (c.id === action.customer.id ? action.customer : c))
        : [action.customer, ...d.customers];
      return { ...state, data: { ...d, customers } };
    }
    case "CUSTOMER_DELETE":
      return { ...state, data: { ...d, customers: d.customers.filter((c) => c.id !== action.id) } };

    case "EXPENSE_SAVE": {
      const exists = d.expenses.some((e) => e.id === action.expense.id);
      const expenses = exists
        ? d.expenses.map((e) => (e.id === action.expense.id ? action.expense : e))
        : [action.expense, ...d.expenses];
      return { ...state, data: { ...d, expenses: expenses.sort((a, b) => +new Date(b.date) - +new Date(a.date)) } };
    }
    case "EXPENSE_DELETE":
      return { ...state, data: { ...d, expenses: d.expenses.filter((e) => e.id !== action.id) } };

    case "PURCHASE_ADD": {
      let products = d.products;
      const movements: Movement[] = [];
      action.purchase.items.forEach((it) => {
        products = products.map((p) =>
          p.id === it.productId ? { ...p, stock: p.stock + it.qty, cost: it.cost, updatedAt: new Date().toISOString() } : p
        );
        movements.push({
          id: uid("mv"), date: action.purchase.date, type: "Purchase", productId: it.productId,
          productName: it.name, qty: it.qty, note: `Restock · ${action.purchase.ref}`,
        });
      });
      return {
        ...state,
        data: { ...d, products, purchases: [action.purchase, ...d.purchases], movements: [...movements, ...d.movements] },
      };
    }

    case "STAFF_SAVE":
      return { ...state, data: { ...d, staff: [action.member, ...d.staff] } };
    case "STAFF_STATUS":
      return {
        ...state,
        data: { ...d, staff: d.staff.map((s) => (s.id === action.id ? { ...s, status: action.status } : s)) },
      };

    case "MOVEMENT_ADD": {
      const dir = action.movement.qty;
      const products = d.products.map((p) =>
        p.id === action.movement.productId
          ? { ...p, stock: Math.max(0, p.stock + dir), updatedAt: new Date().toISOString() }
          : p
      );
      return { ...state, data: { ...d, products, movements: [action.movement, ...d.movements] } };
    }

    case "HELD_SAVE":
      return { ...state, data: { ...d, heldSales: [action.held, ...d.heldSales] } };
    case "HELD_REMOVE":
      return { ...state, data: { ...d, heldSales: d.heldSales.filter((h) => h.id !== action.id) } };

    case "SETTINGS_UPDATE":
      return { ...state, data: { ...d, settings: action.settings } };
    case "PLAN_CONFIRMED":
      return { ...state, data: { ...d, plan: action.plan } };
    case "DATA_RESET":
      return state;
    case "DATA_LOAD":
      return { ...state, data: action.data };

    case "TOAST_PUSH":
      return { ...state, toasts: [...state.toasts.slice(-3), action.toast] };
    case "TOAST_REMOVE":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

/* --------------------------------- context -------------------------------- */

interface Ctx {
  data: BusinessData;
  dataLoading: boolean;
  toasts: Toast[];
  dispatch: React.Dispatch<Action>;
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const AppCtx = createContext<Ctx | null>(null);

const emptyData: BusinessData = {
  products: [], customers: [], sales: [], expenses: [], purchases: [], movements: [],
  staff: [], heldSales: [], auditLogs: [], nextReceiptNo: 1,
  settings: { name: "", type: "", phone: "", location: "", region: "", currency: "GHS (GH₵)" },
  plan: "Free",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, reducerDispatch] = useReducer(reducer, { data: emptyData, toasts: [] });
  const [dataLoading, setDataLoading] = React.useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const session = authService.getSession();
      if (active) setDataLoading(true);
      if (!session?.business.id) {
        if (active) setDataLoading(false);
        return;
      }
      try {
        const data = await loadBusinessData(session.business.id);
        if (active) reducerDispatch({ type: "DATA_LOAD", data });
      } catch (error: unknown) {
        console.error("Unable to load business data", error);
      } finally {
        if (active) setDataLoading(false);
      }
    };
    void load();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const dispatch = useCallback((action: Action) => {
    const session = authService.getSession();
    const businessId = session?.business.id;
    if (!businessId) return;

    const persist = async () => {
      if (action.type === "SALE_COMPLETE") {
        await supabase.rpc("create_sale", {
          target_business_id: businessId,
          target_branch_id: null,
          target_customer_id: action.input.customerId,
          target_customer_name: action.input.customerName,
          target_receipt_number: action.sale.receipt,
          target_subtotal: action.input.items.reduce((sum, item) => sum + item.price * item.qty, 0),
          target_discount: action.input.discount,
          target_total: action.sale.total,
          target_due_date: action.input.dueDate,
          target_items: action.input.items.map((item) => ({ product_id: item.productId, product_name: item.name, quantity: item.qty, unit_price: item.price, unit_cost: item.cost, line_total: item.price * item.qty })),
          target_payments: action.sale.payments.map((payment) => ({ amount: payment.amount, method: databasePaymentMethod(payment.method) })),
        }).then(({ error }) => { if (error) throw error; });
      } else if (action.type === "PAYMENT_RECORD") {
        const { error } = await supabase.rpc("record_sale_payment", { target_business_id: businessId, target_sale_id: action.saleId, payment_amount: action.amount, payment_method: action.method });
        if (error) throw error;
      } else if (action.type === "SALE_VOID") {
        const { error } = await supabase.rpc("void_sale", { target_business_id: businessId, target_sale_id: action.saleId, void_reason: action.reason });
        if (error) throw error;
      } else if (action.type === "PRODUCT_SAVE") {
        const isDatabaseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(action.product.id);
        const productRow = {
          ...(isDatabaseId ? { id: action.product.id } : {}),
          business_id: businessId,
          name: action.product.name,
          sku: action.product.sku || null,
          category: action.product.category,
          supplier: action.product.supplier,
          price: action.product.price,
          cost: action.product.cost,
          stock: action.product.stock,
          min_stock: action.product.minStock,
          unit: action.product.unit,
          active: true,
        };
        const { error } = await supabase.from("products").upsert(productRow);
        if (error) throw error;
      } else if (action.type === "PRODUCT_DELETE") {
        const { error } = await supabase.from("products").update({ active: false }).eq("id", action.id).eq("business_id", businessId);
        if (error) throw error;
      } else if (action.type === "CUSTOMER_SAVE") {
        const isDatabaseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(action.customer.id);
        const { error } = await supabase.from("customers").upsert({
          ...(isDatabaseId ? { id: action.customer.id } : {}),
          business_id: businessId,
          name: action.customer.name,
          phone: action.customer.phone,
          email: action.customer.email ?? null,
          address: action.customer.region,
        });
        if (error) throw error;
      } else if (action.type === "CUSTOMER_DELETE") {
        const { error } = await supabase.from("customers").delete().eq("id", action.id).eq("business_id", businessId);
        if (error) throw error;
      } else if (action.type === "EXPENSE_SAVE") {
        const { error } = await supabase.from("expenses").upsert({ id: action.expense.id, business_id: businessId, category: action.expense.category, description: action.expense.description, amount: action.expense.amount, expense_date: action.expense.date });
        if (error) throw error;
      } else if (action.type === "EXPENSE_DELETE") {
        const { error } = await supabase.from("expenses").delete().eq("id", action.id).eq("business_id", businessId);
        if (error) throw error;
      } else if (action.type === "MOVEMENT_ADD") {
        const { error } = await supabase.rpc("record_stock_movement", {
          target_business_id: businessId,
          target_branch_id: null,
          target_product_id: action.movement.productId,
          movement_kind: action.movement.type.toLowerCase(),
          movement_quantity: action.movement.qty,
          movement_note: action.movement.note,
        });
        if (error) throw error;
      } else if (action.type === "STAFF_STATUS") {
        const status = action.status === "Active" ? "active" : action.status === "Invited" ? "invited" : "suspended";
        const { error } = await supabase.from("business_members").update({ status }).eq("business_id", businessId).eq("user_id", action.id);
        if (error) throw error;
      } else if (action.type === "SETTINGS_UPDATE") {
        const { error } = await supabase.rpc("update_business_settings", {
          target_business_id: businessId,
          business_name: action.settings.name,
          business_type: action.settings.type,
          business_region: action.settings.region,
          business_phone: action.settings.phone,
        });
        if (error) throw error;
      }
      reducerDispatch(action);
    };
    void persist().catch((error: unknown) => console.error("Database update failed", error));
  }, []);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = uid("t");
    dispatch({ type: "TOAST_PUSH", toast: { id, message, tone } });
    window.setTimeout(() => dispatch({ type: "TOAST_REMOVE", id }), 4000);
  }, []);

  const value = useMemo(
    () => ({ data: state.data, dataLoading, toasts: state.toasts, dispatch, toast }),
    [state, dataLoading, dispatch, toast]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

/* --------------------------- theme (appearance) --------------------------- */

export type ThemePref = "light" | "dark" | "system";
const THEME_KEY = "kasabiz_theme_v1";

export function useTheme() {
  const [pref, setPref] = React.useState<ThemePref>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "dark" || saved === "system" || saved === "light" ? saved : "light";
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, pref);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = pref === "system" ? (mq.matches ? "dark" : "light") : pref;
      document.documentElement.dataset.theme = resolved;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);

  return { pref, setPref };
}

/* --------------------------- toast host visuals --------------------------- */

export function useToastTone(tone: Toast["tone"]) {
  return tone;
}
