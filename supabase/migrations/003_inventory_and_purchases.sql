create or replace function public.record_stock_movement(
  target_business_id uuid,
  target_branch_id uuid,
  target_product_id uuid,
  movement_kind text,
  movement_quantity numeric,
  movement_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  movement_id uuid;
begin
  if not public.has_business_role(target_business_id, array['owner', 'manager']) then
    raise exception 'You do not have permission to adjust stock';
  end if;
  if movement_quantity = 0 then
    raise exception 'Movement quantity cannot be zero';
  end if;

  update public.products
  set stock = stock + movement_quantity, updated_at = timezone('utc', now())
  where id = target_product_id and business_id = target_business_id
    and stock + movement_quantity >= 0;
  if not found then
    raise exception 'Product not found or stock would become negative';
  end if;

  insert into public.stock_movements (
    business_id, branch_id, product_id, movement_type, quantity, note, created_by
  )
  values (
    target_business_id, target_branch_id, target_product_id, movement_kind,
    movement_quantity, movement_note, auth.uid()
  )
  returning id into movement_id;
  return movement_id;
end;
$$;

create or replace function public.update_business_settings(
  target_business_id uuid,
  business_name text,
  business_type text,
  business_region text,
  business_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_business_role(target_business_id, array['owner', 'manager']) then
    raise exception 'You do not have permission to update settings';
  end if;
  update public.businesses
  set name = trim(business_name), business_type = trim(business_type),
      region = trim(business_region), phone = trim(business_phone),
      updated_at = timezone('utc', now())
  where id = target_business_id;
end;
$$;

revoke all on function public.record_stock_movement(uuid, uuid, uuid, text, numeric, text) from public;
revoke all on function public.update_business_settings(uuid, text, text, text, text) from public;
grant execute on function public.record_stock_movement(uuid, uuid, uuid, text, numeric, text) to authenticated;
grant execute on function public.update_business_settings(uuid, text, text, text, text) to authenticated;
