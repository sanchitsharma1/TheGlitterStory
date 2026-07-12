-- The Jewel Nest - Supabase schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type staff_role as enum ('super_admin', 'staff');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'pending_payment',
    'placed',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('cod', 'razorpay');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type discount_type as enum ('percent', 'fixed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type coupon_scope as enum ('all', 'category', 'product');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_type as enum (
    'low_stock',
    'out_of_stock',
    'new_order',
    'system'
  );
exception when duplicate_object then null;
end $$;

-- Site settings (return window, shipping rules, contact placeholders, policies)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Staff profiles (linked to Supabase Auth users)
create table if not exists staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role staff_role not null default 'staff',
  is_active boolean not null default true,
  -- granular access for staff (super_admin ignores this and has full access)
  permissions jsonb not null default '{
    "products": true,
    "categories": true,
    "orders": true,
    "coupons": true,
    "inventory": true,
    "dashboard": true,
    "settings": false,
    "staff": false
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id)
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  -- optional size / measurement note (flexible; not required)
  size_info text,
  price numeric(12,2) not null check (price >= 0),
  -- if set and greater than price, product shows as on sale
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 3,
  category_id uuid references categories(id) on delete set null,
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_active_idx on products(is_active);
create index if not exists products_stock_idx on products(stock);

-- Coupons
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null check (discount_value > 0),
  scope coupon_scope not null default 'all',
  category_id uuid references categories(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  min_order_value numeric(12,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupon_scope_target check (
    (scope = 'all' and category_id is null and product_id is null)
    or (scope = 'category' and category_id is not null and product_id is null)
    or (scope = 'product' and product_id is not null and category_id is null)
  )
);

create unique index if not exists coupons_code_upper_idx on coupons (upper(code));

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status order_status not null default 'placed',
  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  coupon_id uuid references coupons(id) on delete set null,
  coupon_code text,
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists orders_status_idx on orders(status);

-- Order line items (snapshot of product at purchase time)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_title text not null,
  product_slug text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null,
  image_url text
);

create index if not exists order_items_order_idx on order_items(order_id);

-- Admin notifications (out of stock, new orders, etc.)
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null,
  title text not null,
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_unread_idx
  on admin_notifications(is_read, created_at desc);

-- Updated_at helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists staff_profiles_updated on staff_profiles;
create trigger staff_profiles_updated
  before update on staff_profiles
  for each row execute function set_updated_at();

drop trigger if exists categories_updated on categories;
create trigger categories_updated
  before update on categories
  for each row execute function set_updated_at();

drop trigger if exists products_updated on products;
create trigger products_updated
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists coupons_updated on coupons;
create trigger coupons_updated
  before update on coupons
  for each row execute function set_updated_at();

drop trigger if exists orders_updated on orders;
create trigger orders_updated
  before update on orders
  for each row execute function set_updated_at();

-- Atomic stock decrement (prevents oversell)
create or replace function decrement_stock(p_product_id uuid, p_qty int)
returns boolean
language plpgsql
as $$
declare
  new_stock int;
  threshold int;
  product_title text;
begin
  update products
  set stock = stock - p_qty
  where id = p_product_id
    and stock >= p_qty
  returning stock, low_stock_threshold, title
  into new_stock, threshold, product_title;

  if not found then
    return false;
  end if;

  if new_stock = 0 then
    insert into admin_notifications (type, title, message, meta)
    values (
      'out_of_stock',
      'Product sold out',
      product_title || ' is now SOLD OUT.',
      jsonb_build_object('product_id', p_product_id, 'stock', 0)
    );
  elsif new_stock <= threshold then
    insert into admin_notifications (type, title, message, meta)
    values (
      'low_stock',
      'Low stock alert',
      product_title || ' has only ' || new_stock || ' left.',
      jsonb_build_object('product_id', p_product_id, 'stock', new_stock)
    );
  end if;

  return true;
end;
$$;

-- RLS
alter table site_settings enable row level security;
alter table staff_profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_notifications enable row level security;

-- Public read for catalog
create policy "Public can read active categories"
  on categories for select
  using (is_active = true);

create policy "Public can read active products"
  on products for select
  using (is_active = true);

-- Staff helpers
create or replace function is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_profiles
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_profiles
    where id = auth.uid() and is_active = true and role = 'super_admin'
  );
$$;

-- Staff full access policies (mutations go through service role or authenticated staff)
create policy "Staff read all categories"
  on categories for select to authenticated
  using (is_active_staff());

create policy "Staff manage categories"
  on categories for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff read all products"
  on products for select to authenticated
  using (is_active_staff());

create policy "Staff manage products"
  on products for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff manage coupons"
  on coupons for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff read coupons"
  on coupons for select to authenticated
  using (is_active_staff());

create policy "Staff manage orders"
  on orders for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff manage order items"
  on order_items for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff manage notifications"
  on admin_notifications for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());

create policy "Staff read settings"
  on site_settings for select to authenticated
  using (is_active_staff());

create policy "Super admin manage settings"
  on site_settings for all to authenticated
  using (is_super_admin())
  with check (is_super_admin());

create policy "Staff read own profile"
  on staff_profiles for select to authenticated
  using (id = auth.uid() or is_super_admin());

create policy "Super admin manage staff"
  on staff_profiles for all to authenticated
  using (is_super_admin())
  with check (is_super_admin());

-- Public can read non-sensitive settings (for shipping rules on storefront)
create policy "Public read site settings"
  on site_settings for select
  using (true);

-- Storage bucket for product images (run once; ignore error if exists)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Staff upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and is_active_staff());

create policy "Staff update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'products' and is_active_staff());

create policy "Staff delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products' and is_active_staff());
