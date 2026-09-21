/** Shared application types, reference lists, and formatting helpers. */
import { daysAgoISO } from "../lib/format";

/* --------------------------------- types --------------------------------- */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  unit: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  region: string;
  email?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
}

export interface Sale {
  id: string;
  receipt: string;
  receiptNo: number;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  method: string; // method of the *first* payment (or "Credit")
  date: string;
  dueDate: string | null;
  cashier: string;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
}

export interface AuditLog {
  id: string;
  action: "Sale voided";
  entityId: string;
  entityLabel: string;
  actor: string;
  reason: string;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  method: string;
  date: string;
}

export interface Purchase {
  id: string;
  ref: string;
  supplier: string;
  items: { productId: string; name: string; qty: number; cost: number }[];
  total: number;
  date: string;
  status: "Paid" | "Partial" | "Credit";
}

export interface Movement {
  id: string;
  date: string;
  type: "Purchase" | "Sale" | "Return" | "Adjustment" | "Damage";
  productId: string;
  productName: string;
  qty: number; // signed
  note: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Manager" | "Cashier" | "Staff";
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
}

export interface HeldSale {
  id: string;
  label: string;
  customerId: string | null;
  items: SaleItem[];
  savedAt: string;
}

export interface BusinessSettings {
  name: string;
  type: string;
  phone: string;
  location: string;
  region: string;
  currency: string;
}

export interface BusinessData {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  purchases: Purchase[];
  movements: Movement[];
  staff: StaffMember[];
  heldSales: HeldSale[];
  auditLogs: AuditLog[];
  nextReceiptNo: number;
  settings: BusinessSettings;
  plan: "Free" | "Pro" | "Business";
}

/* ------------------------------ reference data ---------------------------- */

export const GH_REGIONS = [
  "Greater Accra", "Ashanti", "Eastern", "Central", "Western", "Volta", "Northern",
  "Upper East", "Upper West", "Bono", "Bono East", "Ahafo", "Oti", "Savannah",
  "North East", "Western North",
];

export const BUSINESS_TYPES = [
  "Retail", "Wholesale", "Food", "Fashion", "Beauty", "Electronics", "Pharmacy", "Services", "Other",
];

export const EXPENSE_CATEGORIES = [
  "Rent", "Electricity", "Water", "Transport", "Salaries", "Internet", "Marketing", "Supplies", "Other",
];

export const PRODUCT_CATEGORIES = [
  "T-Shirts", "Shirts", "Jeans", "Dresses", "Sneakers", "Accessories", "Outerwear",
];

const BUSINESS_PRODUCT_CATEGORIES: Record<string, string[]> = {
  pharmacy: ["Medicines", "Vitamins", "Personal Care", "Baby Care", "First Aid", "Medical Equipment"],
  food: ["Food Items", "Beverages", "Snacks", "Fresh Produce", "Household"],
  fashion: ["T-Shirts", "Shirts", "Jeans", "Dresses", "Sneakers", "Accessories", "Outerwear"],
  beauty: ["Skincare", "Hair Care", "Makeup", "Fragrances", "Beauty Tools"],
  electronics: ["Phones", "Computers", "Accessories", "Audio", "Appliances"],
  wholesale: ["General Goods", "Beverages", "Food Items", "Household", "Personal Care"],
  retail: ["General Goods", "Household", "Food Items", "Beverages", "Personal Care"],
  services: ["Service Packages", "Consulting", "Repairs", "Subscriptions"],
  other: ["General Goods", "Other"],
};

export function productCategoriesForBusinessType(type: string): string[] {
  return BUSINESS_PRODUCT_CATEGORIES[type.trim().toLowerCase()] ?? BUSINESS_PRODUCT_CATEGORIES.other;
}

const SUPPLIERS = [
  "Makola Central Traders",
  "Accra Textile Depot",
  "Kumasi Garments Ltd",
  "Tema Footwear Co.",
  "Adom Fashion Supplies",
];

const CATEGORY_TILE: Record<string, string> = {
  "T-Shirts": "#1d5bd6",
  Shirts: "#0891b2",
  Jeans: "#1648ae",
  Dresses: "#be185d",
  Sneakers: "#d97706",
  Accessories: "#0e9f6e",
  Outerwear: "#7c3aed",
};
export const categoryColor = (c: string) => CATEGORY_TILE[c] ?? "#1d5bd6";

/* ---------------------------- seeded random utils ------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260214);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const ri = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

/* --------------------------- legacy fixture helpers ----------------------- */

export const SAMPLE_USER = { name: "", email: "", phone: "" };

export const DEFAULT_SETTINGS: BusinessSettings = {
  name: "",
  type: "Retail",
  phone: "024 555 0182",
  location: "Oxford Street, Osu — Accra",
  region: "Greater Accra",
  currency: "GHS (GH₵)",
};

export const seedProducts = (): Product[] => {
  const rows: Array<[string, string, string, number, number, number, number, string]> = [
    // name, sku, category, price, cost, stock, minStock, supplier
    ["Black T-Shirt", "PF-TSH-001", "T-Shirts", 200, 120, 4, 10, "Accra Textile Depot"],
    ["Blue Jeans", "PF-JNS-014", "Jeans", 350, 220, 5, 8, "Kumasi Garments Ltd"],
    ["Nike Sneakers", "PF-SNK-090", "Sneakers", 850, 600, 2, 5, "Tema Footwear Co."],
    ["Baseball Cap", "PF-ACC-031", "Accessories", 120, 70, 14, 8, "Makola Central Traders"],
    ["Polo Shirt", "PF-SHT-022", "Shirts", 280, 170, 18, 6, "Accra Textile Depot"],
    ["White Formal Shirt", "PF-SHT-023", "Shirts", 260, 150, 22, 6, "Accra Textile Depot"],
    ["Ankara Dress", "PF-DRS-045", "Dresses", 520, 300, 9, 4, "Adom Fashion Supplies"],
    ["Kente Scarf", "PF-ACC-032", "Accessories", 180, 90, 3, 6, "Adom Fashion Supplies"],
    ["Khaki Chinos", "PF-JNS-015", "Jeans", 300, 180, 0, 5, "Kumasi Garments Ltd"],
    ["Grey Hoodie", "PF-OTW-060", "Outerwear", 420, 250, 11, 4, "Kumasi Garments Ltd"],
    ["Leather Belt", "PF-ACC-033", "Accessories", 150, 80, 16, 6, "Makola Central Traders"],
    ["Ankle Boots", "PF-SNK-091", "Sneakers", 700, 450, 3, 4, "Tema Footwear Co."],
    ["Graphic Tee", "PF-TSH-002", "T-Shirts", 220, 130, 1, 6, "Accra Textile Depot"],
    ["Denim Jacket", "PF-OTW-061", "Outerwear", 480, 300, 0, 3, "Kumasi Garments Ltd"],
  ];
  return rows.map(([name, sku, category, price, cost, stock, minStock, supplier], i) => ({
    id: `p${i + 1}`,
    name, sku, category, price, cost, stock, minStock, supplier,
    unit: "piece",
    updatedAt: daysAgoISO(ri(0, 12), ri(8, 18), ri(0, 59)),
  }));
};

export const seedCustomers = (): Customer[] => {
  const rows: Array<[string, string, string, string]> = [
    ["Ama Mensah", "024 417 8823", "Osu", "Greater Accra"],
    ["Kwame Boateng", "054 220 1187", "Madina", "Greater Accra"],
    ["Kofi Asare", "020 913 5540", "Tema", "Greater Accra"],
    ["Akosua Mensima", "055 671 2298", "Cape Coast", "Central"],
    ["Efua Owusu", "027 334 9012", "Kumasi", "Ashanti"],
    ["Yaw Darko", "024 885 7761", "Takoradi", "Western"],
    ["Adwoa Nyame", "050 118 4472", "Koforidua", "Eastern"],
    ["Nana Adjei", "026 402 3315", "Tamale", "Northern"],
  ];
  return rows.map(([name, phone, city, region], i) => ({
    id: `c${i + 1}`, name, phone, city, region,
    email: i % 2 === 0 ? `${name.split(" ")[0].toLowerCase()}@gmail.com` : undefined,
    createdAt: daysAgoISO(ri(30, 220), 11),
  }));
};

/* --------------------------------- sales ---------------------------------- */

const METHODS = ["Cash", "MTN Mobile Money", "MTN Mobile Money", "MTN Mobile Money", "Telecel Cash", "AT Money", "Bank Transfer", "Card", "Cash"];
const CASHIERS = ["Prince Ankomah", "Kojo Antwi", "Kojo Antwi", "Abena Serwaa"];

function makeItems(products: Product[], forced?: { product: Product; qty: number }[]): { items: SaleItem[]; subtotal: number; cogs: number } {
  let items: SaleItem[];
  if (forced) {
    items = forced.map(({ product: p, qty }) => ({ productId: p.id, name: p.name, qty, price: p.price, cost: p.cost }));
  } else {
    const count = ri(1, 3);
    const chosen = new Map<string, number>();
    for (let i = 0; i < count; i++) {
      const p = pick(products.filter((x) => x.stock > 0));
      if (!p) break;
      chosen.set(p.id, (chosen.get(p.id) ?? 0) + ri(1, 2));
    }
    items = [...chosen.entries()].map(([id, qty]) => {
      const p = products.find((x) => x.id === id)!;
      return { productId: id, name: p.name, qty, price: p.price, cost: p.cost };
    });
  }
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const cogs = items.reduce((s, it) => s + it.cost * it.qty, 0);
  return { items, subtotal, cogs };
}

export const seedSales = (products: Product[], customers: Customer[]): Sale[] => {
  const sales: Sale[] = [];
  let receiptNo = 940;
  const push = (s: Omit<Sale, "id" | "receipt" | "receiptNo">) => {
    receiptNo += 1;
    sales.push({ id: `s${receiptNo}`, receipt: `KB-${receiptNo}`, receiptNo, ...s });
  };

  // ---- history: last 30 days (oldest → newest) ----
  for (let day = 30; day >= 1; day--) {
    const count = rnd() < 0.15 ? 0 : ri(1, 5);
    for (let k = 0; k < count; k++) {
      const { items, subtotal } = makeItems(products);
      if (!items.length) continue;
      const discount = rnd() < 0.2 ? Math.round(subtotal * 0.05) : 0;
      const total = subtotal - discount;
      const date = daysAgoISO(day, ri(8, 19), ri(0, 59));
      const customer = rnd() < 0.6 ? pick(customers) : null;
      const isCredit = rnd() < 0.14;
      const method = isCredit ? "Credit" : pick(METHODS);
      const payments: Payment[] = isCredit
        ? // historic credit sales were settled later — except three pinned ones handled below
          [{ id: `pay_${receiptNo + 1}`, amount: total, method: pick(METHODS), date: daysAgoISO(Math.max(0, day - ri(1, 3)), 12) }]
        : [{ id: `pay_${receiptNo}`, amount: total, method, date }];
      push({
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? "Walk-in Customer",
        items, subtotal, discount, total, payments, method, date,
        dueDate: null, cashier: pick(CASHIERS),
      });
    }
  }

  // ---- pinned outstanding debts (total exactly GH₵1,800) ----
  const p = (id: string) => products.find((x) => x.id === id)!;
  const c = (id: string) => customers.find((x) => x.id === id)!;
  const creditSale = (
    cust: Customer, forced: { product: Product; qty: number }[], total: number, paid: number,
    day: number, dueIn: number
  ) => {
    const { items, subtotal } = makeItems(products, forced);
    const date = daysAgoISO(day, ri(10, 17), ri(0, 59));
    const payments: Payment[] = paid
      ? [{ id: `pay_pin_${receiptNo + 1}`, amount: paid, method: "MTN Mobile Money", date: daysAgoISO(Math.max(0, day - 2), 15) }]
      : [];
    push({
      customerId: cust.id, customerName: cust.name, items,
      subtotal, discount: subtotal - total, total, payments,
      method: "Credit", date, dueDate: daysAgoISO(-dueIn, 18), cashier: pick(CASHIERS),
    });
  };
  creditSale(c("c5"), [{ product: p("p7"), qty: 1 }, { product: p("p12"), qty: 1 }, { product: p("p5"), qty: 1 }], 1000, 0, 9, -4); // Efua — overdue
  creditSale(c("c6"), [{ product: p("p12"), qty: 1 }, { product: p("p1"), qty: 1 }], 700, 200, 6, 5); // Yaw — partially paid
  creditSale(c("c7"), [{ product: p("p2"), qty: 1 }, { product: p("p11"), qty: 1 }], 300, 0, 3, 8); // Adwoa — pending

  // ---- today: GH₵1,250 in sales (matches the dashboard) ----
  const t1 = makeItems(products, [{ product: p("p1"), qty: 2 }]);
  push({
    customerId: "c1", customerName: "Ama Mensah", items: t1.items,
    subtotal: 400, discount: 0, total: 400,
    payments: [{ id: "pay_t1", amount: 400, method: "MTN Mobile Money", date: daysAgoISO(0, 9, 42) }],
    method: "MTN Mobile Money", date: daysAgoISO(0, 9, 42), dueDate: null, cashier: "Kojo Antwi",
  });
  const t2 = makeItems(products, [{ product: p("p3"), qty: 1 }]);
  push({
    customerId: "c2", customerName: "Kwame Boateng", items: t2.items,
    subtotal: 850, discount: 0, total: 850,
    payments: [{ id: "pay_t2", amount: 850, method: "Cash", date: daysAgoISO(0, 11, 15) }],
    method: "Cash", date: daysAgoISO(0, 11, 15), dueDate: null, cashier: "Prince Ankomah",
  });

  return sales.reverse(); // newest first
};

/* -------------------------------- expenses -------------------------------- */

export const seedExpenses = (): Expense[] => {
  const out: Expense[] = [];
  let n = 0;
  const add = (description: string, category: string, amount: number, method: string, day: number) => {
    n += 1;
    out.push({ id: `e${n}`, description, category, amount, method, date: daysAgoISO(day, ri(8, 17), ri(0, 59)) });
  };

  // two months of running costs
  add("Shop rent — Osu", "Rent", 1800, "Bank Transfer", 28);
  add("Shop rent — Osu", "Rent", 1800, "Bank Transfer", 0);
  add("ECG electricity bill", "Electricity", 264, "MTN Mobile Money", 24);
  add("ECG electricity bill", "Electricity", 310, "MTN Mobile Money", 2);
  add("Ghana Water bill", "Water", 85, "Cash", 21);
  add("Staff salaries", "Salaries", 1400, "Bank Transfer", 27);
  add("Staff salaries", "Salaries", 1400, "Bank Transfer", 1);
  add("MTN broadband", "Internet", 199, "MTN Mobile Money", 18);
  add("Delivery — Makola restock", "Transport", 150, "Cash", 16);
  add("Trotro fare — bank runs", "Transport", 60, "Cash", 10);
  add("Instagram promo boost", "Marketing", 200, "Card", 12);
  add("Branded paper bags", "Supplies", 240, "Cash", 8);
  add("Receipt rolls & tags", "Supplies", 90, "Cash", 5);
  add("Generator fuel", "Other", 130, "Cash", 14);

  // today — GH₵320 (matches the dashboard)
  add("Delivery from Makola market", "Transport", 120, "Cash", 0);
  add("Packaging & hangers", "Supplies", 200, "MTN Mobile Money", 0);
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
};

/* -------------------------------- purchases ------------------------------- */

export const seedPurchases = (products: Product[]): Purchase[] => {
  const p = (id: string) => products.find((x) => x.id === id)!;
  const mk = (
    ref: string, supplier: string, lines: [string, number][], day: number, status: Purchase["status"]
  ): Purchase => {
    const items = lines.map(([id, qty]) => ({ productId: id, name: p(id).name, qty, cost: p(id).cost }));
    return { id: ref, ref, supplier, items, total: items.reduce((s, it) => s + it.qty * it.cost, 0), date: daysAgoISO(day, 9, 30), status };
  };
  return [
    mk("PO-208", "Accra Textile Depot", [["p1", 24], ["p2", 18], ["p13", 20]], 26, "Paid"),
    mk("PO-209", "Kumasi Garments Ltd", [["p2", 15], ["p9", 12], ["p14", 8]], 20, "Paid"),
    mk("PO-210", "Tema Footwear Co.", [["p3", 10], ["p12", 6]], 15, "Partial"),
    mk("PO-211", "Adom Fashion Supplies", [["p7", 12], ["p8", 20]], 11, "Paid"),
    mk("PO-212", "Makola Central Traders", [["p4", 30], ["p11", 25]], 6, "Credit"),
    mk("PO-213", "Accra Textile Depot", [["p5", 20], ["p6", 24]], 2, "Paid"),
  ];
};

/* -------------------------------- movements ------------------------------- */

export const seedMovements = (products: Product[]): Movement[] => {
  const p = (id: string) => products.find((x) => x.id === id)!;
  const rows: Array<[string, Movement["type"], string, number, string]> = [
    ["Restock from Accra Textile Depot", "Purchase", "p5", 20, "PO-213"],
    ["Restock from Makola Central Traders", "Purchase", "p4", 30, "PO-212"],
    ["Customer return — wrong size", "Return", "p2", 1, "KB-1001"],
    ["Damaged in transit", "Damage", "p13", 1, "Cracked packaging"],
    ["Stock count correction", "Adjustment", "p11", -2, "Monthly count"],
    ["Restock from Tema Footwear Co.", "Purchase", "p3", 10, "PO-210"],
  ];
  return rows.map(([note, type, pid, qty, ref], i) => ({
    id: `m${i + 1}`,
    date: daysAgoISO([2, 6, 9, 13, 17, 15][i] ?? 4, 10, ri(0, 59)),
    type, productId: pid, productName: p(pid).name, qty, note: `${note} · ${ref}`,
  })).sort((a, b) => +new Date(b.date) - +new Date(a.date));
};

/* ---------------------------------- staff --------------------------------- */

export const seedStaff = (): StaffMember[] => [
  { id: "st1", name: "Prince Ankomah", email: "prince@kasabiz.app", role: "Owner", status: "Active", lastActive: daysAgoISO(0, 12) },
  { id: "st2", name: "Abena Serwaa", email: "abena.s@gmail.com", role: "Manager", status: "Active", lastActive: daysAgoISO(0, 9) },
  { id: "st3", name: "Kojo Antwi", email: "kojo.antwi@gmail.com", role: "Cashier", status: "Active", lastActive: daysAgoISO(0, 11) },
  { id: "st4", name: "Linda Mensah", email: "linda.m@outlook.com", role: "Staff", status: "Invited", lastActive: daysAgoISO(4, 16) },
];

export const seedHeldSales = (products: Product[]): HeldSale[] => {
  const p = (id: string) => products.find((x) => x.id === id)!;
  return [{
    id: "h1",
    label: "Akosua — fitting room",
    customerId: "c4",
    items: [
      { productId: "p7", name: p("p7").name, qty: 1, price: p("p7").price, cost: p("p7").cost },
      { productId: "p8", name: p("p8").name, qty: 2, price: p("p8").price, cost: p("p8").cost },
    ],
    savedAt: daysAgoISO(0, 10, 5),
  }];
};

/* ------------------------------- full seed -------------------------------- */

export const buildSeedData = (): BusinessData => {
  const products = seedProducts();
  const customers = seedCustomers();
  const sales = seedSales(products, customers);
  return {
    products,
    customers,
    sales,
    expenses: seedExpenses(),
    purchases: seedPurchases(products),
    movements: seedMovements(products),
    staff: seedStaff(),
    heldSales: seedHeldSales(products),
    auditLogs: [],
    nextReceiptNo: (sales[0]?.receiptNo ?? 1000) + 1,
    settings: { ...DEFAULT_SETTINGS },
    plan: "Business",
  };
};

/* ------------------------------ admin mock data --------------------------- */

export const ADMIN = (() => {
  const r = mulberry32(777);
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const registrations = months.map((m, i) => ({ month: m, users: Math.round(90 + i * 26 + r() * 60) }));
  const revenue = months.map((m, i) => ({ month: m, revenue: Math.round(5200 + i * 1150 + r() * 900) }));
  const regions: Array<[string, number]> = [
    ["Greater Accra", 642], ["Ashanti", 388], ["Central", 174], ["Eastern", 149],
    ["Western", 121], ["Northern", 96], ["Volta", 74], ["Bono", 58], ["Upper East", 41], ["Other", 189],
  ];
  const types: Array<[string, number]> = [
    ["Retail", 512], ["Food", 344], ["Fashion", 298], ["Beauty", 205],
    ["Electronics", 172], ["Services", 154], ["Pharmacy", 118], ["Wholesale", 129],
  ];
  const first = ["Efua", "Kwabena", "Abena", "Kojo", "Adwoa", "Kwesi", "Akua", "Yaw", "Esi", "Nana", "Fiifi", "Maame"];
  const last = ["Mensah", "Owusu", "Asante", "Amoah", "Osei", "Agyeman", "Baah", "Oppong", "Appiah", "Sarpong"];
  const towns: Array<[string, string]> = [
    ["Accra", "Greater Accra"], ["Kumasi", "Ashanti"], ["Tamale", "Northern"], ["Takoradi", "Western"],
    ["Cape Coast", "Central"], ["Tema", "Greater Accra"], ["Koforidua", "Eastern"], ["Sunyani", "Bono"],
    ["Ho", "Volta"], ["Wa", "Upper West"], ["Techiman", "Bono East"], ["Bolgatanga", "Upper East"],
  ];
  const bizNames = ["Provisions", "Fashion", "Foods", "Electronics", "Beauty Hub", "Trading", "Ventures", "Pharmacy", "Salon", "Motors"];
  const plans = ["Free", "Free", "Free", "Pro", "Pro", "Business"] as const;
  const users = Array.from({ length: 10 }, (_, i) => {
    const name = `${first[Math.floor(r() * first.length)]} ${last[Math.floor(r() * last.length)]}`;
    return {
      id: `u${i + 1}`, name,
      email: `${name.split(" ")[0].toLowerCase()}${ri(2, 90)}@gmail.com`,
      plan: plans[Math.floor(r() * plans.length)],
      region: towns[Math.floor(r() * towns.length)][1],
      joined: daysAgoISO(Math.floor(r() * 45), 10),
      status: r() > 0.15 ? "Active" : "Inactive",
    };
  });
  const businesses = Array.from({ length: 8 }, (_, i) => {
    const owner = `${first[Math.floor(r() * first.length)]} ${last[Math.floor(r() * last.length)]}`;
    const t = towns[Math.floor(r() * towns.length)];
    return {
      id: `b${i + 1}`,
      name: `${owner.split(" ")[0]}'s ${bizNames[Math.floor(r() * bizNames.length)]}`,
      owner, type: BUSINESS_TYPES[Math.floor(r() * BUSINESS_TYPES.length)],
      city: t[0], region: t[1],
      plan: plans[Math.floor(r() * plans.length)],
      joined: daysAgoISO(Math.floor(r() * 60), 12),
    };
  });
  return {
    totals: { users: 2847, businesses: 1932, activeBusinesses: 1120, mrr: 18450, free: 1284, pro: 428, business: 220 },
    registrations, revenue,
    regions: regions.map(([name, count]) => ({ name, count })),
    types: types.map(([name, count]) => ({ name, count })),
    users, businesses,
  };
})();
