-- Optional migration: product material/care + customer reviews
-- Run once in Supabase SQL Editor

alter table products add column if not exists material_info text;
alter table products add column if not exists care_notes text;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_approved_idx on reviews (is_approved, created_at desc);
create index if not exists reviews_product_idx on reviews (product_id);

alter table reviews enable row level security;

drop policy if exists "Public read approved reviews" on reviews;
create policy "Public read approved reviews"
  on reviews for select
  using (is_approved = true);

drop policy if exists "Staff manage reviews" on reviews;
create policy "Staff manage reviews"
  on reviews for all to authenticated
  using (is_active_staff())
  with check (is_active_staff());
