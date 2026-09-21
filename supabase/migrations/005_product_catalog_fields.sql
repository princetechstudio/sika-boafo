alter table public.products
  add column if not exists category text not null default 'Other',
  add column if not exists supplier text not null default '';
