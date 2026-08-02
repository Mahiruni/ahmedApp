-- BILOO Phase 2 production foundation.
-- Auth, role onboarding, shared commerce data, RLS, transactional ordering,
-- and Realtime publications for customer-scoped updates.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

do $$ begin
  create type public.biloo_user_role as enum (
    'customer',
    'driver',
    'vendor_owner',
    'vendor_staff',
    'support',
    'finance',
    'admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.biloo_service_type as enum (
    'food',
    'taxi',
    'market',
    'construction',
    'parts'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.biloo_order_status as enum (
    'payment_pending',
    'confirmed',
    'vendor_accepted',
    'preparing',
    'ready_for_pickup',
    'driver_assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'cancelled_by_customer',
    'cancelled_by_vendor',
    'cancelled_by_driver',
    'failed',
    'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.biloo_role_application_status as enum (
    'pending',
    'approved',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

create sequence if not exists public.biloo_order_public_seq start 20500;

create table if not exists public.biloo_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.biloo_user_role not null default 'customer',
  display_name text not null default 'BILOO member',
  phone text,
  email text,
  avatar_url text,
  city text not null default 'Addis Ababa',
  status text not null default 'active' check (status in ('active', 'suspended', 'disabled')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_role_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.biloo_profiles(id) on delete cascade,
  requested_role public.biloo_user_role not null
    check (requested_role in ('driver', 'vendor_owner')),
  status public.biloo_role_application_status not null default 'pending',
  notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.biloo_profiles(id),
  created_at timestamptz not null default now(),
  unique (user_id, requested_role)
);

create table if not exists public.biloo_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.biloo_profiles(id) on delete cascade,
  label text not null,
  formatted_address text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  delivery_note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.biloo_profiles(id) on delete set null,
  service_type public.biloo_service_type not null,
  legal_name text not null,
  display_name text not null,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  commission_rate numeric(6, 3) not null default 0 check (commission_rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_vendor_branches (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.biloo_vendors(id) on delete cascade,
  name text not null,
  formatted_address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_products (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  vendor_id uuid not null references public.biloo_vendors(id) on delete cascade,
  branch_id uuid references public.biloo_vendor_branches(id) on delete set null,
  service_type public.biloo_service_type not null,
  sku text,
  name text not null,
  description text,
  category text,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  currency char(3) not null default 'ETB',
  stock_quantity numeric(14, 3),
  rating numeric(3, 2),
  eta_label text,
  badge text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique default (
    'BL-' || lpad(nextval('public.biloo_order_public_seq')::text, 6, '0')
  ),
  customer_id uuid not null references public.biloo_profiles(id),
  vendor_id uuid references public.biloo_vendors(id),
  branch_id uuid references public.biloo_vendor_branches(id),
  service_type public.biloo_service_type not null,
  status public.biloo_order_status not null default 'confirmed',
  title text not null,
  delivery_address_id uuid references public.biloo_addresses(id),
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  delivery_fee_minor bigint not null default 0 check (delivery_fee_minor >= 0),
  service_fee_minor bigint not null default 0 check (service_fee_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  total_minor bigint not null default 0 check (total_minor >= 0),
  currency char(3) not null default 'ETB',
  payment_method text not null default 'cash'
    check (payment_method in ('wallet', 'card', 'cash')),
  eta_minutes integer,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.biloo_orders(id) on delete cascade,
  product_id uuid references public.biloo_products(id),
  external_id_snapshot text,
  name_snapshot text not null,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  quantity numeric(14, 3) not null check (quantity > 0),
  line_total_minor bigint not null check (line_total_minor >= 0)
);

create table if not exists public.biloo_driver_profiles (
  id uuid primary key references public.biloo_profiles(id) on delete cascade,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  vehicle_type text,
  plate_number text,
  is_online boolean not null default false,
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  location_updated_at timestamptz,
  rating numeric(3, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biloo_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.biloo_orders(id) on delete cascade,
  driver_id uuid not null references public.biloo_driver_profiles(id),
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.biloo_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.biloo_profiles(id) on delete cascade,
  title text not null,
  message text not null,
  channel text not null default 'in_app'
    check (channel in ('in_app', 'push', 'email', 'sms')),
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'queued',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.biloo_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.biloo_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon;
grant execute on function private.touch_updated_at() to authenticated, service_role;

create or replace function private.current_user_role()
returns public.biloo_user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.biloo_profiles p
  where p.id = (select auth.uid())
    and p.status = 'active';
$$;

revoke all on function private.current_user_role() from public, anon;
grant execute on function private.current_user_role() to authenticated, service_role;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.biloo_profiles (
    id,
    role,
    display_name,
    email
  )
  values (
    new.id,
    'customer',
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'BILOO member'),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function private.handle_new_user();

do $$
declare
  target text;
begin
  foreach target in array array[
    'biloo_profiles',
    'biloo_addresses',
    'biloo_vendors',
    'biloo_vendor_branches',
    'biloo_products',
    'biloo_orders',
    'biloo_driver_profiles'
  ] loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', target, target);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',
      target,
      target
    );
  end loop;
end $$;

alter table public.biloo_profiles enable row level security;
alter table public.biloo_role_applications enable row level security;
alter table public.biloo_addresses enable row level security;
alter table public.biloo_vendors enable row level security;
alter table public.biloo_vendor_branches enable row level security;
alter table public.biloo_products enable row level security;
alter table public.biloo_orders enable row level security;
alter table public.biloo_order_items enable row level security;
alter table public.biloo_driver_profiles enable row level security;
alter table public.biloo_assignments enable row level security;
alter table public.biloo_notifications enable row level security;
alter table public.biloo_audit_log enable row level security;

-- Data API privileges are explicit because new public tables may not be
-- automatically exposed by current Supabase project settings.
grant select on public.biloo_vendors, public.biloo_vendor_branches, public.biloo_products to anon;
grant select on public.biloo_vendors, public.biloo_vendor_branches, public.biloo_products to authenticated;
grant select on public.biloo_profiles to authenticated;
grant update (display_name, phone, avatar_url, city, onboarding_completed_at)
  on public.biloo_profiles to authenticated;
grant select on public.biloo_role_applications to authenticated;
grant insert (user_id, requested_role, status)
  on public.biloo_role_applications to authenticated;
grant select, insert, update, delete on public.biloo_addresses to authenticated;
grant select on public.biloo_orders, public.biloo_order_items to authenticated;
grant select, update (status, updated_at) on public.biloo_orders to authenticated;
grant select, update (is_online, current_latitude, current_longitude, location_updated_at)
  on public.biloo_driver_profiles to authenticated;
grant select, update (accepted_at, picked_up_at, completed_at)
  on public.biloo_assignments to authenticated;
grant select, update (read_at) on public.biloo_notifications to authenticated;
grant select on public.biloo_audit_log to authenticated;

grant all on public.biloo_profiles,
  public.biloo_role_applications,
  public.biloo_addresses,
  public.biloo_vendors,
  public.biloo_vendor_branches,
  public.biloo_products,
  public.biloo_orders,
  public.biloo_order_items,
  public.biloo_driver_profiles,
  public.biloo_assignments,
  public.biloo_notifications,
  public.biloo_audit_log
  to service_role;
grant all on sequence public.biloo_order_public_seq,
  public.biloo_audit_log_id_seq to service_role;

drop policy if exists "profiles_select_own_or_admin" on public.biloo_profiles;
create policy "profiles_select_own_or_admin"
on public.biloo_profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "profiles_update_own_or_admin" on public.biloo_profiles;
create policy "profiles_update_own_or_admin"
on public.biloo_profiles for update to authenticated
using (
  id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
)
with check (
  id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "role_applications_select" on public.biloo_role_applications;
create policy "role_applications_select"
on public.biloo_role_applications for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "role_applications_insert_own" on public.biloo_role_applications;
create policy "role_applications_insert_own"
on public.biloo_role_applications for insert to authenticated
with check (
  user_id = (select auth.uid())
  and requested_role in ('driver', 'vendor_owner')
  and status = 'pending'
);

drop policy if exists "addresses_manage_own" on public.biloo_addresses;
create policy "addresses_manage_own"
on public.biloo_addresses for all to authenticated
using (
  customer_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
)
with check (
  customer_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "vendors_public_or_owner" on public.biloo_vendors;
drop policy if exists "vendors_public_verified" on public.biloo_vendors;
create policy "vendors_public_verified"
on public.biloo_vendors for select to anon, authenticated
using (verification_status = 'verified');

drop policy if exists "vendors_owner_admin" on public.biloo_vendors;
create policy "vendors_owner_admin"
on public.biloo_vendors for select to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "vendor_branches_public" on public.biloo_vendor_branches;
create policy "vendor_branches_public"
on public.biloo_vendor_branches for select to anon, authenticated
using (
  exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id and v.verification_status = 'verified'
  )
);

drop policy if exists "vendor_branches_owner_admin" on public.biloo_vendor_branches;
create policy "vendor_branches_owner_admin"
on public.biloo_vendor_branches for select to authenticated
using (
  exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id
      and (
        v.owner_id = (select auth.uid())
        or (select private.current_user_role()) = 'admin'
      )
  )
);

drop policy if exists "products_public_active" on public.biloo_products;
create policy "products_public_active"
on public.biloo_products for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id and v.verification_status = 'verified'
  )
);

drop policy if exists "products_owner_admin" on public.biloo_products;
create policy "products_owner_admin"
on public.biloo_products for select to authenticated
using (
  exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id
      and (
        v.owner_id = (select auth.uid())
        or (select private.current_user_role()) = 'admin'
      )
  )
);

drop policy if exists "orders_select_authorized" on public.biloo_orders;
create policy "orders_select_authorized"
on public.biloo_orders for select to authenticated
using (
  customer_id = (select auth.uid())
  or exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id and v.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.biloo_assignments a
    where a.order_id = id and a.driver_id = (select auth.uid())
  )
  or (select private.current_user_role()) in ('support', 'finance', 'admin')
);

drop policy if exists "orders_update_operator" on public.biloo_orders;
create policy "orders_update_operator"
on public.biloo_orders for update to authenticated
using (
  exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id and v.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.biloo_assignments a
    where a.order_id = id and a.driver_id = (select auth.uid())
  )
  or (select private.current_user_role()) in ('support', 'admin')
)
with check (
  exists (
    select 1 from public.biloo_vendors v
    where v.id = vendor_id and v.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.biloo_assignments a
    where a.order_id = id and a.driver_id = (select auth.uid())
  )
  or (select private.current_user_role()) in ('support', 'admin')
);

drop policy if exists "order_items_select_authorized" on public.biloo_order_items;
create policy "order_items_select_authorized"
on public.biloo_order_items for select to authenticated
using (
  exists (
    select 1 from public.biloo_orders o
    where o.id = order_id
      and (
        o.customer_id = (select auth.uid())
        or exists (
          select 1 from public.biloo_vendors v
          where v.id = o.vendor_id and v.owner_id = (select auth.uid())
        )
        or exists (
          select 1 from public.biloo_assignments a
          where a.order_id = o.id and a.driver_id = (select auth.uid())
        )
        or (select private.current_user_role()) in ('support', 'finance', 'admin')
      )
  )
);

drop policy if exists "driver_profiles_select" on public.biloo_driver_profiles;
create policy "driver_profiles_select"
on public.biloo_driver_profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select private.current_user_role()) in ('support', 'admin')
);

drop policy if exists "driver_profiles_update_own" on public.biloo_driver_profiles;
create policy "driver_profiles_update_own"
on public.biloo_driver_profiles for update to authenticated
using (id = (select auth.uid()) or (select private.current_user_role()) = 'admin')
with check (id = (select auth.uid()) or (select private.current_user_role()) = 'admin');

drop policy if exists "assignments_select_authorized" on public.biloo_assignments;
create policy "assignments_select_authorized"
on public.biloo_assignments for select to authenticated
using (
  driver_id = (select auth.uid())
  or exists (
    select 1 from public.biloo_orders o
    where o.id = order_id and o.customer_id = (select auth.uid())
  )
  or (select private.current_user_role()) in ('support', 'admin')
);

drop policy if exists "assignments_update_driver" on public.biloo_assignments;
create policy "assignments_update_driver"
on public.biloo_assignments for update to authenticated
using (driver_id = (select auth.uid()) or (select private.current_user_role()) = 'admin')
with check (driver_id = (select auth.uid()) or (select private.current_user_role()) = 'admin');

drop policy if exists "notifications_manage_own" on public.biloo_notifications;
create policy "notifications_manage_own"
on public.biloo_notifications for select to authenticated
using (
  recipient_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

drop policy if exists "notifications_mark_read" on public.biloo_notifications;
create policy "notifications_mark_read"
on public.biloo_notifications for update to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

drop policy if exists "audit_admin_only" on public.biloo_audit_log;
create policy "audit_admin_only"
on public.biloo_audit_log for select to authenticated
using ((select private.current_user_role()) = 'admin');

create or replace function public.place_biloo_order(
  p_items jsonb,
  p_payment_method text,
  p_delivery_address_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := (select auth.uid());
  v_vendor_id uuid;
  v_service_type public.biloo_service_type;
  v_vendor_name text;
  v_subtotal bigint;
  v_delivery_fee bigint;
  v_service_fee bigint;
  v_order_id uuid;
  v_vendor_count integer;
  v_resolved_count integer;
  v_requested_count integer;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  if p_payment_method is null
     or p_payment_method not in ('wallet', 'card', 'cash') then
    raise exception 'Unsupported payment method';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one item is required';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'An order cannot contain more than 50 distinct products';
  end if;

  v_requested_count := jsonb_array_length(p_items);

  if exists (
    select 1
    from jsonb_array_elements(p_items) item
    where coalesce(item ->> 'external_id', '') = ''
       or length(item ->> 'external_id') > 100
       or coalesce(item ->> 'quantity', '') !~ '^[1-9][0-9]?$'
  ) then
    raise exception 'Every item requires a valid external_id and positive quantity';
  end if;

  if (
    select count(*) <> count(distinct item ->> 'external_id')
    from jsonb_array_elements(p_items) item
  ) then
    raise exception 'Duplicate products are not allowed';
  end if;

  perform 1
  from jsonb_array_elements(p_items) item
  join public.biloo_products p
    on p.external_id = item ->> 'external_id'
  for update of p;

  select
    (array_agg(p.vendor_id))[1],
    (array_agg(p.service_type))[1],
    (array_agg(v.display_name))[1],
    count(distinct p.vendor_id),
    sum(p.unit_price_minor * requested.quantity)::bigint,
    count(*)
  into
    v_vendor_id,
    v_service_type,
    v_vendor_name,
    v_vendor_count,
    v_subtotal,
    v_resolved_count
  from (
    select
      item ->> 'external_id' as external_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) item
  ) requested
  join public.biloo_products p
    on p.external_id = requested.external_id
   and p.is_active
   and (p.stock_quantity is null or p.stock_quantity >= requested.quantity)
  join public.biloo_vendors v
    on v.id = p.vendor_id
   and v.verification_status = 'verified';

  if v_vendor_id is null or v_subtotal is null or v_resolved_count <> v_requested_count then
    raise exception 'One or more products are unavailable';
  end if;

  if v_vendor_count <> 1 then
    raise exception 'Items from different vendors must be ordered separately';
  end if;

  if p_delivery_address_id is not null and not exists (
    select 1 from public.biloo_addresses a
    where a.id = p_delivery_address_id
      and a.customer_id = v_customer_id
  ) then
    raise exception 'Invalid delivery address';
  end if;

  v_delivery_fee := case when v_service_type = 'construction' then 25000 else 7500 end;
  v_service_fee := round(v_subtotal * 0.025)::bigint;

  insert into public.biloo_orders (
    customer_id,
    vendor_id,
    service_type,
    status,
    title,
    delivery_address_id,
    subtotal_minor,
    delivery_fee_minor,
    service_fee_minor,
    total_minor,
    payment_method,
    eta_minutes
  )
  values (
    v_customer_id,
    v_vendor_id,
    v_service_type,
    case when p_payment_method = 'card' then 'payment_pending' else 'confirmed' end,
    v_vendor_name || ' order',
    p_delivery_address_id,
    v_subtotal,
    v_delivery_fee,
    v_service_fee,
    v_subtotal + v_delivery_fee + v_service_fee,
    p_payment_method,
    case when v_service_type = 'construction' then 180 else 28 end
  )
  returning id into v_order_id;

  insert into public.biloo_order_items (
    order_id,
    product_id,
    external_id_snapshot,
    name_snapshot,
    unit_price_minor,
    quantity,
    line_total_minor
  )
  select
    v_order_id,
    p.id,
    p.external_id,
    p.name,
    p.unit_price_minor,
    requested.quantity,
    p.unit_price_minor * requested.quantity
  from (
    select
      item ->> 'external_id' as external_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) item
  ) requested
  join public.biloo_products p on p.external_id = requested.external_id;

  update public.biloo_products p
  set stock_quantity = p.stock_quantity - requested.quantity,
      updated_at = now()
  from (
    select
      item ->> 'external_id' as external_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) item
  ) requested
  where p.external_id = requested.external_id
    and p.stock_quantity is not null;

  insert into public.biloo_notifications (recipient_id, title, message, payload)
  select
    v_customer_id,
    'Order placed',
    'Your order ' || o.public_id || ' has been created.',
    jsonb_build_object('order_id', o.id, 'public_id', o.public_id)
  from public.biloo_orders o
  where o.id = v_order_id;

  insert into public.biloo_audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    context
  ) values (
    v_customer_id,
    'order.created',
    'order',
    v_order_id::text,
    jsonb_build_object('service_type', v_service_type, 'payment_method', p_payment_method)
  );

  return v_order_id;
end;
$$;

revoke all on function public.place_biloo_order(jsonb, text, uuid) from public, anon;
grant execute on function public.place_biloo_order(jsonb, text, uuid) to authenticated;

create or replace function public.request_biloo_ride(
  p_pickup text,
  p_dropoff text,
  p_ride_class text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := (select auth.uid());
  v_order_id uuid;
  v_fare bigint;
  v_eta integer;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(length(trim(p_pickup)), 0) < 3
     or coalesce(length(trim(p_dropoff)), 0) < 3 then
    raise exception 'Pickup and destination are required';
  end if;

  if length(p_pickup) > 200 or length(p_dropoff) > 200 then
    raise exception 'Pickup and destination must be shorter than 200 characters';
  end if;

  v_fare := case p_ride_class
    when 'standard' then 42000
    when 'comfort' then 61000
    when 'xl' then 79000
    else null
  end;

  v_eta := case p_ride_class
    when 'standard' then 3
    when 'comfort' then 6
    when 'xl' then 8
    else null
  end;

  if v_fare is null then
    raise exception 'Unsupported ride class';
  end if;

  insert into public.biloo_orders (
    customer_id,
    service_type,
    status,
    title,
    subtotal_minor,
    total_minor,
    payment_method,
    eta_minutes,
    metadata
  ) values (
    v_customer_id,
    'taxi',
    'confirmed',
    'Biloo ' || initcap(p_ride_class) || ' to ' || trim(p_dropoff),
    v_fare,
    v_fare,
    'cash',
    v_eta,
    jsonb_build_object(
      'pickup', trim(p_pickup),
      'dropoff', trim(p_dropoff),
      'ride_class', p_ride_class
    )
  ) returning id into v_order_id;

  insert into public.biloo_notifications (recipient_id, title, message, payload)
  select
    v_customer_id,
    'Ride requested',
    'We are finding a nearby driver for ' || o.public_id || '.',
    jsonb_build_object('order_id', o.id, 'public_id', o.public_id)
  from public.biloo_orders o
  where o.id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.request_biloo_ride(text, text, text) from public, anon;
grant execute on function public.request_biloo_ride(text, text, text) to authenticated;

create or replace function public.review_biloo_role_application(
  p_application_id uuid,
  p_status public.biloo_role_application_status,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer uuid := (select auth.uid());
  v_application public.biloo_role_applications%rowtype;
begin
  if v_reviewer is null or (select private.current_user_role()) <> 'admin' then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Review status must be approved or rejected';
  end if;

  select * into v_application
  from public.biloo_role_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Role application not found';
  end if;

  update public.biloo_role_applications
  set status = p_status,
      notes = nullif(trim(p_notes), ''),
      reviewed_at = now(),
      reviewed_by = v_reviewer
  where id = p_application_id;

  if p_status = 'approved' then
    update public.biloo_profiles
    set role = v_application.requested_role,
        updated_at = now()
    where id = v_application.user_id;

    if v_application.requested_role = 'driver' then
      insert into public.biloo_driver_profiles (id)
      values (v_application.user_id)
      on conflict (id) do nothing;
    end if;
  end if;

  insert into public.biloo_notifications (
    recipient_id,
    title,
    message,
    payload
  ) values (
    v_application.user_id,
    case when p_status = 'approved' then 'Role approved' else 'Application reviewed' end,
    case
      when p_status = 'approved' then 'Your BILOO ' || replace(v_application.requested_role::text, '_', ' ') || ' access is now active.'
      else 'Your role application was not approved. Open your account for details.'
    end,
    jsonb_build_object('application_id', p_application_id, 'status', p_status)
  );

  insert into public.biloo_audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    context
  ) values (
    v_reviewer,
    'role_application.reviewed',
    'role_application',
    p_application_id::text,
    jsonb_build_object('status', p_status, 'requested_role', v_application.requested_role)
  );
end;
$$;

revoke all on function public.review_biloo_role_application(uuid, public.biloo_role_application_status, text)
  from public, anon;
grant execute on function public.review_biloo_role_application(uuid, public.biloo_role_application_status, text)
  to authenticated;

create or replace function private.enforce_order_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role public.biloo_user_role := (select private.current_user_role());
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' then
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;

  if v_role in ('admin', 'support') then
    return new;
  end if;

  if v_role in ('vendor_owner', 'vendor_staff') and (
    (old.status = 'confirmed' and new.status in ('vendor_accepted', 'cancelled_by_vendor'))
    or (old.status = 'vendor_accepted' and new.status in ('preparing', 'cancelled_by_vendor'))
    or (old.status = 'preparing' and new.status in ('ready_for_pickup', 'cancelled_by_vendor'))
    or (old.status = 'ready_for_pickup' and new.status = 'driver_assigned')
  ) then
    return new;
  end if;

  if v_role = 'driver' and (
    (old.status = 'driver_assigned' and new.status in ('picked_up', 'cancelled_by_driver'))
    or (old.status = 'picked_up' and new.status = 'in_transit')
    or (old.status = 'in_transit' and new.status = 'delivered')
  ) then
    return new;
  end if;

  raise exception 'Invalid order status transition from % to % for role %',
    old.status, new.status, coalesce(v_role::text, 'unknown');
end;
$$;

revoke all on function private.enforce_order_status_transition() from public, anon;
grant execute on function private.enforce_order_status_transition() to authenticated, service_role;

drop trigger if exists biloo_orders_status_transition on public.biloo_orders;
create trigger biloo_orders_status_transition
  before update of status on public.biloo_orders
  for each row execute function private.enforce_order_status_transition();

create index if not exists biloo_profiles_role_idx
  on public.biloo_profiles(role, status);
create index if not exists biloo_vendors_owner_idx
  on public.biloo_vendors(owner_id) where owner_id is not null;
create index if not exists biloo_vendors_verified_idx
  on public.biloo_vendors(service_type, display_name)
  where verification_status = 'verified';
create index if not exists biloo_vendor_branches_vendor_idx
  on public.biloo_vendor_branches(vendor_id);
create index if not exists biloo_role_applications_status_idx
  on public.biloo_role_applications(status, created_at desc);
create index if not exists biloo_addresses_customer_idx
  on public.biloo_addresses(customer_id, is_default desc);
create index if not exists biloo_products_vendor_active_idx
  on public.biloo_products(vendor_id, is_active);
create index if not exists biloo_products_service_active_idx
  on public.biloo_products(service_type, is_active);
create index if not exists biloo_orders_customer_created_idx
  on public.biloo_orders(customer_id, created_at desc);
create index if not exists biloo_orders_vendor_status_idx
  on public.biloo_orders(vendor_id, status, created_at desc);
create index if not exists biloo_order_items_order_idx
  on public.biloo_order_items(order_id);
create index if not exists biloo_order_items_product_idx
  on public.biloo_order_items(product_id) where product_id is not null;
create index if not exists biloo_assignments_driver_idx
  on public.biloo_assignments(driver_id, assigned_at desc);
create index if not exists biloo_notifications_recipient_created_idx
  on public.biloo_notifications(recipient_id, created_at desc);

-- Seed catalog vendors used by the Phase 1 interface. They are system-owned
-- until a verified vendor account claims and replaces them.
insert into public.biloo_vendors (
  id, owner_id, service_type, legal_name, display_name, verification_status
) values
  ('10000000-0000-4000-8000-000000000001', null, 'food', 'Kategna Kitchen PLC', 'Kategna Kitchen', 'verified'),
  ('10000000-0000-4000-8000-000000000002', null, 'food', 'Bole Grill PLC', 'Bole Grill', 'verified'),
  ('10000000-0000-4000-8000-000000000003', null, 'food', 'Addis Pizza Company', 'Addis Pizza Co.', 'verified'),
  ('10000000-0000-4000-8000-000000000004', null, 'food', 'Tomoca Express PLC', 'Tomoca Express', 'verified'),
  ('10000000-0000-4000-8000-000000000005', null, 'market', 'Fresh Corner PLC', 'Fresh Corner', 'verified'),
  ('10000000-0000-4000-8000-000000000006', null, 'market', 'Sheger Market PLC', 'Sheger Market', 'verified'),
  ('10000000-0000-4000-8000-000000000007', null, 'market', 'Green Basket PLC', 'Green Basket', 'verified'),
  ('10000000-0000-4000-8000-000000000008', null, 'construction', 'Abay Building Supply PLC', 'Abay Building Supply', 'verified'),
  ('10000000-0000-4000-8000-000000000009', null, 'construction', 'Metro Steel PLC', 'Metro Steel', 'verified'),
  ('10000000-0000-4000-8000-000000000010', null, 'construction', 'Addis Blocks PLC', 'Addis Blocks', 'verified'),
  ('10000000-0000-4000-8000-000000000011', null, 'construction', 'BuildPro Tools PLC', 'BuildPro Tools', 'verified'),
  ('10000000-0000-4000-8000-000000000012', null, 'parts', 'Abyssinia Auto Parts PLC', 'Abyssinia Auto Parts', 'verified'),
  ('10000000-0000-4000-8000-000000000013', null, 'parts', 'Korean Motors Supply PLC', 'Korean Motors Supply', 'verified'),
  ('10000000-0000-4000-8000-000000000014', null, 'parts', 'Bole Battery Center PLC', 'Bole Battery Center', 'verified')
on conflict (id) do update set
  display_name = excluded.display_name,
  verification_status = excluded.verification_status,
  updated_at = now();

insert into public.biloo_products (
  external_id, vendor_id, service_type, name, description, category,
  unit_price_minor, stock_quantity, rating, eta_label, badge, icon
) values
  ('food-1', '10000000-0000-4000-8000-000000000001', 'food', 'Special Beyaynetu', 'A generous Ethiopian fasting platter with fresh injera.', 'Ethiopian', 42000, null, 4.8, '25–35 min', 'Popular', '🍲'),
  ('food-2', '10000000-0000-4000-8000-000000000002', 'food', 'Tibs Combo', 'Sizzling beef tibs, vegetables, salad and injera.', 'Grill', 56000, null, 4.7, '30–40 min', 'Chef pick', '🥘'),
  ('food-3', '10000000-0000-4000-8000-000000000003', 'food', 'Family Margherita', 'Large stone-baked pizza with mozzarella and basil.', 'Pizza', 69000, null, 4.6, '20–30 min', null, '🍕'),
  ('food-4', '10000000-0000-4000-8000-000000000004', 'food', 'Coffee & Pastry Box', 'Four hot drinks and a mixed pastry selection.', 'Coffee', 48000, null, 4.9, '15–25 min', 'Fast delivery', '☕'),
  ('market-1', '10000000-0000-4000-8000-000000000005', 'market', 'Weekly Fresh Basket', 'Seasonal vegetables, fruit, herbs and eggs.', 'Fresh produce', 148000, 22, 4.8, '25–35 min', 'Best value', '🥬'),
  ('market-2', '10000000-0000-4000-8000-000000000006', 'market', 'Home Essentials Pack', 'Rice, pasta, oil, sugar, flour and cleaning basics.', 'Household', 232000, 14, 4.7, '30–45 min', null, '🛍️'),
  ('market-3', '10000000-0000-4000-8000-000000000005', 'market', 'Baby Care Bundle', 'Diapers, wipes, baby soap and lotion.', 'Baby care', 189000, 9, 4.6, '25–35 min', 'Limited stock', '🧴'),
  ('market-4', '10000000-0000-4000-8000-000000000007', 'market', 'Organic Breakfast Box', 'Milk, honey, oats, fruit and fresh bread.', 'Breakfast', 124000, 18, 4.9, '20–30 min', null, '🥛'),
  ('construction-1', '10000000-0000-4000-8000-000000000008', 'construction', 'OPC Cement · 50kg', 'High-strength general construction cement.', 'Cement', 142000, 340, 4.8, 'Same day', 'Verified supplier', '🏗️'),
  ('construction-2', '10000000-0000-4000-8000-000000000009', 'construction', 'Rebar 12mm · 12m', 'Standard reinforced steel bar for structural work.', 'Steel', 238000, 186, 4.7, '2–4 hrs', null, '🔩'),
  ('construction-3', '10000000-0000-4000-8000-000000000010', 'construction', 'Hollow Block · 20cm', 'Machine-pressed construction block, sold per piece.', 'Blocks', 9600, 2400, 4.6, 'Same day', 'Bulk pricing', '🧱'),
  ('construction-4', '10000000-0000-4000-8000-000000000011', 'construction', 'Professional Drill Kit', 'Corded drill, bits, case and safety accessories.', 'Tools', 865000, 12, 4.9, '1–2 hrs', null, '🛠️'),
  ('parts-1', '10000000-0000-4000-8000-000000000012', 'parts', 'Toyota Corolla Brake Pads', 'Front ceramic brake pad set for selected Corolla models.', 'Braking', 385000, 18, 4.9, '1–3 hrs', 'Compatibility checked', '⚙️'),
  ('parts-2', '10000000-0000-4000-8000-000000000013', 'parts', 'Hyundai Oil Filter', 'OEM-grade engine oil filter for common Hyundai models.', 'Engine', 78000, 46, 4.8, '1–2 hrs', null, '🔧'),
  ('parts-3', '10000000-0000-4000-8000-000000000014', 'parts', 'Maintenance-Free Battery', '12V 70Ah battery with installation support.', 'Electrical', 1380000, 8, 4.7, '45–90 min', 'Installation available', '🔋'),
  ('parts-4', '10000000-0000-4000-8000-000000000012', 'parts', 'Universal Wiper Pair', 'All-weather frameless wipers with multiple adapters.', 'Exterior', 145000, 31, 4.6, '1–3 hrs', null, '🚘')
on conflict (external_id) do update set
  vendor_id = excluded.vendor_id,
  service_type = excluded.service_type,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  unit_price_minor = excluded.unit_price_minor,
  stock_quantity = excluded.stock_quantity,
  rating = excluded.rating,
  eta_label = excluded.eta_label,
  badge = excluded.badge,
  icon = excluded.icon,
  is_active = true,
  updated_at = now();

-- Realtime is deliberately limited to the tables used by the customer flow.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'biloo_orders'
  ) then
    alter publication supabase_realtime add table public.biloo_orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'biloo_notifications'
  ) then
    alter publication supabase_realtime add table public.biloo_notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'biloo_assignments'
  ) then
    alter publication supabase_realtime add table public.biloo_assignments;
  end if;
end $$;
