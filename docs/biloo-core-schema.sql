-- BILOO core PostgreSQL schema draft.
-- This file is an architecture reference, not an applied production migration.

create type biloo_user_role as enum (
  'customer',
  'driver',
  'vendor_owner',
  'vendor_staff',
  'support',
  'finance',
  'admin'
);

create type biloo_service_type as enum (
  'food',
  'taxi',
  'market',
  'construction',
  'parts'
);

create type biloo_order_status as enum (
  'draft',
  'quoted',
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

create table biloo_profiles (
  id uuid primary key,
  role biloo_user_role not null,
  display_name text not null,
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table biloo_addresses (
  id uuid primary key,
  customer_id uuid not null references biloo_profiles(id),
  label text not null,
  formatted_address text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  delivery_note text,
  created_at timestamptz not null default now()
);

create table biloo_vendors (
  id uuid primary key,
  owner_id uuid not null references biloo_profiles(id),
  service_type biloo_service_type not null,
  legal_name text not null,
  display_name text not null,
  verification_status text not null default 'pending',
  commission_rate numeric(6, 3) not null default 0,
  created_at timestamptz not null default now()
);

create table biloo_vendor_branches (
  id uuid primary key,
  vendor_id uuid not null references biloo_vendors(id),
  name text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  is_open boolean not null default false,
  created_at timestamptz not null default now()
);

create table biloo_products (
  id uuid primary key,
  vendor_id uuid not null references biloo_vendors(id),
  branch_id uuid references biloo_vendor_branches(id),
  service_type biloo_service_type not null,
  sku text,
  name text not null,
  description text,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  currency char(3) not null default 'ETB',
  stock_quantity numeric(14, 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table biloo_orders (
  id uuid primary key,
  public_id text not null unique,
  customer_id uuid not null references biloo_profiles(id),
  vendor_id uuid references biloo_vendors(id),
  branch_id uuid references biloo_vendor_branches(id),
  service_type biloo_service_type not null,
  status biloo_order_status not null default 'draft',
  delivery_address_id uuid references biloo_addresses(id),
  subtotal_minor bigint not null default 0,
  delivery_fee_minor bigint not null default 0,
  service_fee_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  total_minor bigint not null default 0,
  currency char(3) not null default 'ETB',
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table biloo_order_items (
  id uuid primary key,
  order_id uuid not null references biloo_orders(id) on delete cascade,
  product_id uuid references biloo_products(id),
  name_snapshot text not null,
  unit_price_minor bigint not null,
  quantity numeric(14, 3) not null check (quantity > 0),
  line_total_minor bigint not null
);

create table biloo_driver_profiles (
  id uuid primary key references biloo_profiles(id),
  verification_status text not null default 'pending',
  is_online boolean not null default false,
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  location_updated_at timestamptz,
  rating numeric(3, 2),
  created_at timestamptz not null default now()
);

create table biloo_assignments (
  id uuid primary key,
  order_id uuid not null unique references biloo_orders(id),
  driver_id uuid not null references biloo_driver_profiles(id),
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  completed_at timestamptz
);

create table biloo_payment_intents (
  id uuid primary key,
  order_id uuid not null references biloo_orders(id),
  provider text not null,
  provider_reference text,
  status text not null,
  amount_minor bigint not null,
  currency char(3) not null default 'ETB',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table biloo_notifications (
  id uuid primary key,
  recipient_id uuid not null references biloo_profiles(id),
  channel text not null,
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'queued',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table biloo_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references biloo_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index biloo_orders_customer_created_idx
  on biloo_orders(customer_id, created_at desc);
create index biloo_orders_vendor_status_idx
  on biloo_orders(vendor_id, status, created_at desc);
create index biloo_products_vendor_active_idx
  on biloo_products(vendor_id, is_active);
create index biloo_notifications_recipient_created_idx
  on biloo_notifications(recipient_id, created_at desc);

-- Production migration requirements:
-- 1. Add the actual authentication foreign-key relationship.
-- 2. Apply row-level or API authorization policies for every exposed table.
-- 3. Put privileged payment and dispatch functions in a private schema.
-- 4. Add immutable wallet ledger tables before enabling stored balances.
-- 5. Add PostGIS/geospatial indexes if the selected database supports them.
