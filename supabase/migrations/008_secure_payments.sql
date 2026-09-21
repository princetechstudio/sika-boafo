create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  reference text not null unique,
  transaction_id text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'GHS',
  plan text not null check (plan in ('Business')),
  billing text not null check (billing in ('monthly', 'yearly')),
  status text not null check (status in ('success', 'failed')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.payment_transactions enable row level security;

create policy payment_transactions_member_select
  on public.payment_transactions for select
  using (public.is_business_member(business_id));

create or replace function public.prevent_client_plan_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plan is distinct from old.plan
     and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Plan changes must be completed through verified payment';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_business_plan on public.businesses;
create trigger protect_business_plan
  before update on public.businesses
  for each row execute function public.prevent_client_plan_change();
