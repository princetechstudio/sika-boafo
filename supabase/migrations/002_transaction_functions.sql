create or replace function public.create_sale(
  target_business_id uuid,
  target_branch_id uuid,
  target_customer_id uuid,
  target_customer_name text,
  target_receipt_number text,
  target_subtotal numeric,
  target_discount numeric,
  target_total numeric,
  target_due_date date,
  target_items jsonb,
  target_payments jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_sale_id uuid;
  item record;
  payment record;
  current_stock numeric;
begin
  if not public.has_business_role(target_business_id, array['owner', 'manager', 'cashier']) then
    raise exception 'You do not have permission to create sales';
  end if;

  if jsonb_array_length(coalesce(target_items, '[]'::jsonb)) = 0 then
    raise exception 'A sale must contain at least one item';
  end if;

  if target_total < 0 or target_subtotal < 0 or target_discount < 0 then
    raise exception 'Sale amounts cannot be negative';
  end if;

  for item in
    select *
    from jsonb_to_recordset(target_items) as x(
      product_id uuid,
      product_name text,
      quantity numeric,
      unit_price numeric,
      unit_cost numeric,
      line_total numeric
    )
  loop
    select stock into current_stock
    from public.products
    where id = item.product_id
      and business_id = target_business_id
      and active = true
    for update;

    if not found then
      raise exception 'Product is unavailable';
    end if;

    if item.quantity <= 0 or item.unit_price < 0 or item.unit_cost < 0 or item.line_total < 0 then
      raise exception 'Invalid sale item';
    end if;

    if current_stock < item.quantity then
      raise exception 'Insufficient stock for %', item.product_name;
    end if;
  end loop;

  insert into public.sales (
    business_id, branch_id, customer_id, receipt_number, cashier_id,
    customer_name, subtotal, discount, total, due_date
  )
  values (
    target_business_id, target_branch_id, target_customer_id, target_receipt_number, auth.uid(),
    coalesce(nullif(trim(target_customer_name), ''), 'Walk-in customer'),
    target_subtotal, target_discount, target_total, target_due_date
  )
  returning id into new_sale_id;

  for item in
    select *
    from jsonb_to_recordset(target_items) as x(
      product_id uuid,
      product_name text,
      quantity numeric,
      unit_price numeric,
      unit_cost numeric,
      line_total numeric
    )
  loop
    insert into public.sale_items (
      business_id, sale_id, product_id, product_name, quantity,
      unit_price, unit_cost, line_total
    )
    values (
      target_business_id, new_sale_id, item.product_id, item.product_name,
      item.quantity, item.unit_price, item.unit_cost, item.line_total
    );

    update public.products
    set stock = stock - item.quantity,
        updated_at = timezone('utc', now())
    where id = item.product_id
      and business_id = target_business_id;

    insert into public.stock_movements (
      business_id, branch_id, product_id, movement_type, quantity,
      reference_id, note, created_by
    )
    values (
      target_business_id, target_branch_id, item.product_id, 'sale',
      -item.quantity, new_sale_id, 'Sale ' || target_receipt_number, auth.uid()
    );
  end loop;

  for payment in
    select *
    from jsonb_to_recordset(coalesce(target_payments, '[]'::jsonb)) as x(
      amount numeric,
      method text,
      reference text
    )
  loop
    if payment.amount <= 0 then
      raise exception 'Payment amount must be positive';
    end if;

    insert into public.payments (
      business_id, sale_id, amount, method, reference, received_by
    )
    values (
      target_business_id, new_sale_id, payment.amount, payment.method,
      payment.reference, auth.uid()
    );
  end loop;

  insert into public.audit_logs (
    business_id, actor_id, action, entity_type, entity_id, entity_label
  )
  values (
    target_business_id, auth.uid(), 'Sale created', 'sale',
    new_sale_id, 'Receipt #' || target_receipt_number
  );

  return new_sale_id;
end;
$$;

create or replace function public.record_sale_payment(
  target_business_id uuid,
  target_sale_id uuid,
  payment_amount numeric,
  payment_method text,
  payment_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_payment_id uuid;
begin
  if not public.has_business_role(target_business_id, array['owner', 'manager', 'cashier']) then
    raise exception 'You do not have permission to record payments';
  end if;

  if payment_amount <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  if not exists (
    select 1 from public.sales
    where id = target_sale_id
      and business_id = target_business_id
      and status = 'completed'
  ) then
    raise exception 'Sale is unavailable';
  end if;

  insert into public.payments (
    business_id, sale_id, amount, method, reference, received_by
  )
  values (
    target_business_id, target_sale_id, payment_amount,
    payment_method, payment_reference, auth.uid()
  )
  returning id into new_payment_id;

  insert into public.audit_logs (
    business_id, actor_id, action, entity_type, entity_id, metadata
  )
  values (
    target_business_id, auth.uid(), 'Payment recorded', 'sale',
    target_sale_id, jsonb_build_object('amount', payment_amount, 'method', payment_method)
  );

  return new_payment_id;
end;
$$;

create or replace function public.void_sale(
  target_business_id uuid,
  target_sale_id uuid,
  void_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sale_row public.sales%rowtype;
  item record;
begin
  if not public.has_business_role(target_business_id, array['owner', 'manager']) then
    raise exception 'Only an owner or manager can void sales';
  end if;

  if length(trim(coalesce(void_reason, ''))) < 3 then
    raise exception 'A void reason is required';
  end if;

  select * into sale_row
  from public.sales
  where id = target_sale_id
    and business_id = target_business_id
  for update;

  if not found then
    raise exception 'Sale not found';
  end if;

  if sale_row.status = 'voided' then
    raise exception 'Sale has already been voided';
  end if;

  for item in
    select product_id, quantity
    from public.sale_items
    where sale_id = target_sale_id
  loop
    update public.products
    set stock = stock + item.quantity,
        updated_at = timezone('utc', now())
    where id = item.product_id
      and business_id = target_business_id;

    insert into public.stock_movements (
      business_id, branch_id, product_id, movement_type, quantity,
      reference_id, note, created_by
    )
    values (
      target_business_id, sale_row.branch_id, item.product_id, 'return',
      item.quantity, target_sale_id, 'Voided sale ' || sale_row.receipt_number, auth.uid()
    );
  end loop;

  update public.sales
  set status = 'voided',
      voided_at = timezone('utc', now()),
      voided_by = auth.uid(),
      void_reason = trim(void_reason),
      updated_at = timezone('utc', now())
  where id = target_sale_id;

  insert into public.audit_logs (
    business_id, actor_id, action, entity_type, entity_id, entity_label, reason
  )
  values (
    target_business_id, auth.uid(), 'Sale voided', 'sale',
    target_sale_id, 'Receipt #' || sale_row.receipt_number, trim(void_reason)
  );
end;
$$;

revoke all on function public.create_sale(uuid, uuid, uuid, text, text, numeric, numeric, numeric, date, jsonb, jsonb) from public;
revoke all on function public.record_sale_payment(uuid, uuid, numeric, text, text) from public;
revoke all on function public.void_sale(uuid, uuid, text) from public;
grant execute on function public.create_sale(uuid, uuid, uuid, text, text, numeric, numeric, numeric, date, jsonb, jsonb) to authenticated;
grant execute on function public.record_sale_payment(uuid, uuid, numeric, text, text) to authenticated;
grant execute on function public.void_sale(uuid, uuid, text) to authenticated;
