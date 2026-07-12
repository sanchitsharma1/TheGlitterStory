-- Run AFTER you create your first user in Supabase Authentication.
-- Steps:
-- 1. Supabase Dashboard → Authentication → Users → Add user
--    - Email: your admin email
--    - Password: strong password
--    - Auto Confirm User: ON
-- 2. Copy the user's UUID from the users table
-- 3. Replace YOUR_USER_UUID and details below, then run this SQL

insert into staff_profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  permissions
) values (
  'YOUR_USER_UUID',
  'you@example.com',
  'Owner',
  'super_admin',
  true,
  '{
    "products": true,
    "categories": true,
    "orders": true,
    "coupons": true,
    "inventory": true,
    "dashboard": true,
    "settings": true,
    "staff": true
  }'::jsonb
)
on conflict (id) do update set
  role = 'super_admin',
  is_active = true,
  full_name = excluded.full_name,
  email = excluded.email;
