create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null,
  region text,
  phone text,
  email text,
  plan text not null default 'Free' check (plan in ('Free', 'Pro', 'Business')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'cashier', 'viewer')),
  display_name text not null,
  phone text,
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (business_id, user_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, name)
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (business_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  category_id uuid references public.product_categories(id) on delete set null,
  sku text,
  name text not null,
  description text,
  unit text not null default 'item',
  cost numeric(12,2) not null default 0 check (cost >= 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  stock numeric(12,3) not null default 0 check (stock >= 0),
  min_stock numeric(12,3) not null default 0 check (min_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, sku)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  receipt_number text not null,
  cashier_id uuid references auth.users(id) on delete set null,
  customer_name text not null default 'Walk-in customer',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'completed' check (status in ('completed', 'voided')),
  due_date date,
  voided_at timestamptz,
  voided_by uuid references auth.users(id) on delete set null,
  void_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, receipt_number),
  check ((status = 'completed' and voided_at is null and voided_by is null and void_reason is null)
    or (status = 'voided' and voided_at is not null and voided_by is not null and length(trim(void_reason)) >= 3))
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  product_name text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('Cash', 'MTN MoMo', 'Telecel Cash', 'AT Money', 'Card', 'Other')),
  reference text,
  received_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null check (movement_type in ('purchase', 'sale', 'return', 'adjustment', 'opening')),
  quantity numeric(12,3) not null check (quantity <> 0),
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  reference text not null,
  total numeric(12,2) not null default 0 check (total >= 0),
  purchase_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (business_id, reference)
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.message_queue (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  recipient text not null,
  channel text not null default 'sms' check (channel in ('sms', 'email', 'whatsapp')),
  template text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'delivered', 'failed')),
  provider_message_id text,
  error_message text,
  attempts integer not null default 0 check (attempts >= 0),
  scheduled_for timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index products_business_idx on public.products (business_id);
create index sales_business_date_idx on public.sales (business_id, created_at desc);
create index sale_items_sale_idx on public.sale_items (sale_id);
create index sale_items_business_idx on public.sale_items (business_id);
create index payments_sale_idx on public.payments (sale_id);
create index purchase_items_business_idx on public.purchase_items (business_id);
create index stock_movements_product_idx on public.stock_movements (business_id, product_id, created_at desc);
create index audit_logs_business_idx on public.audit_logs (business_id, created_at desc);
create index message_queue_status_idx on public.message_queue (status, scheduled_for);

create trigger businesses_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger sales_updated_at before update on public.sales for each row execute function public.set_updated_at();
create trigger expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_business_role(target_business_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any(allowed_roles)
  );
$$;

create or replace function public.create_business(
  business_name text,
  business_type text,
  business_region text,
  member_name text,
  member_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_business_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.businesses (name, business_type, region, created_by)
  values (business_name, business_type, business_region, auth.uid())
  returning id into new_business_id;

  insert into public.business_members (business_id, user_id, role, display_name, phone)
  values (new_business_id, auth.uid(), 'owner', member_name, member_phone);

  return new_business_id;
end;
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.branches enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;
alter table public.expenses enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.message_queue enable row level security;

create policy businesses_member_select on public.businesses for select using (public.is_business_member(id));
create policy businesses_authenticated_insert on public.businesses for insert with check (auth.uid() = created_by);
create policy businesses_owner_update on public.businesses for update using (public.has_business_role(id, array['owner', 'manager']));
create policy members_member_select on public.business_members for select using (public.is_business_member(business_id));
create policy members_manager_write on public.business_members for all using (public.has_business_role(business_id, array['owner', 'manager'])) with check (public.has_business_role(business_id, array['owner', 'manager']));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'branches', 'product_categories', 'products', 'customers', 'sales',
    'sale_items', 'payments', 'stock_movements', 'expenses', 'suppliers',
    'purchases', 'purchase_items', 'audit_logs', 'message_queue'
  ] loop
    execute format(
      'create policy %I_member_access on public.%I for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id))',
      table_name || '_member_access',
      table_name
    );
  end loop;
end $$;
