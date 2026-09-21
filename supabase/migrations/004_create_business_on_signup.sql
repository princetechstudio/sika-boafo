create or replace function public.create_business_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_business_id uuid;
  metadata jsonb := new.raw_user_meta_data;
begin
  if coalesce(metadata->>'business_name', '') = ''
     or coalesce(metadata->>'business_type', '') = ''
     or coalesce(metadata->>'full_name', '') = '' then
    return new;
  end if;

  if exists (select 1 from public.business_members where user_id = new.id) then
    return new;
  end if;

  insert into public.businesses (name, business_type, region, created_by)
  values (
    metadata->>'business_name',
    metadata->>'business_type',
    coalesce(metadata->>'region', ''),
    new.id
  )
  returning id into new_business_id;

  insert into public.business_members (business_id, user_id, role, display_name, phone)
  values (
    new_business_id,
    new.id,
    'owner',
    metadata->>'full_name',
    coalesce(metadata->>'phone', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_business_for_new_user();
