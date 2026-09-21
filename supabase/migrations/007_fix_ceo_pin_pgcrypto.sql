create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_ceo_pin(pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  member_business_id uuid;
begin
  if pin !~ '^[0-9]{4}$' then
    raise exception 'CEO PIN must be exactly 4 digits';
  end if;

  select business_id into member_business_id
  from public.business_members
  where user_id = auth.uid() and role = 'owner' and status = 'active'
  limit 1;

  if member_business_id is null then
    raise exception 'Only the business owner can set the CEO PIN';
  end if;

  insert into public.business_security (business_id, ceo_pin_hash)
  values (member_business_id, extensions.crypt(pin::text, extensions.gen_salt('bf'::text)))
  on conflict (business_id) do update
    set ceo_pin_hash = excluded.ceo_pin_hash,
        updated_at = timezone('utc', now());
end;
$$;

create or replace function public.verify_ceo_pin(pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  member_business_id uuid;
  stored_hash text;
begin
  if pin !~ '^[0-9]{4}$' then return false; end if;

  select business_id into member_business_id
  from public.business_members
  where user_id = auth.uid() and role = 'owner' and status = 'active'
  limit 1;

  if member_business_id is null then return false; end if;

  select ceo_pin_hash into stored_hash
  from public.business_security
  where business_id = member_business_id;

  return stored_hash is not null and stored_hash = extensions.crypt(pin::text, stored_hash::text);
end;
$$;
