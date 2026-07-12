-- Default site settings for The Jewel Nest
-- Run after schema.sql

insert into site_settings (key, value) values
(
  'commerce',
  '{
    "currency": "INR",
    "currency_symbol": "₹",
    "free_shipping_threshold": 600,
    "shipping_fee": 120,
    "cod_min_order": 299,
    "service_region": "India",
    "allow_cod": true,
    "allow_razorpay": false
  }'::jsonb
),
(
  'returns',
  '{
    "return_window_days": 7,
    "policy_summary": "Unused items in original packaging may be returned or exchanged within the return window. Earrings and hygiene-sensitive pieces are exchange-only for safety. Custom or made-to-order pieces are final sale unless damaged on arrival."
  }'::jsonb
),
(
  'contact',
  '{
    "brand_name": "The Jewel Nest",
    "email": "support@thejewelnest.co.in",
    "phone": "",
    "whatsapp": "",
    "instagram": "thejewel_nest",
    "address_line": "",
    "city": "",
    "state": "",
    "pincode": "",
    "country": "India"
  }'::jsonb
),
(
  'brand',
  '{
    "tagline": "Modern jewellery, quietly luxurious.",
    "parent_brand": "The Glitter Story",
    "parent_brand_note": "The Jewel Nest is the jewellery house of The Glitter Story - born from the same love of polish, detail, and everyday glam.",
    "about_short": "Curated modern jewellery for women who dress for themselves. Designed to stack, gift, and live in - from scroll to doorstep."
  }'::jsonb
),
(
  'policies',
  '{
    "shipping_summary": "We currently ship across India only. Orders above ₹600 enjoy free shipping. Orders below ₹600 include a flat shipping fee of ₹120. Delivery timelines typically range from 4-10 business days depending on your pincode.",
    "privacy_summary": "We collect only the information needed to fulfil your order (name, phone, email, and delivery address). We do not sell your data. Payment card details are processed securely by Razorpay and never stored on our servers.",
    "terms_summary": "By placing an order on thejewelnest.co.in you agree to our pricing, shipping, and return policies. Product colours may vary slightly due to lighting and screen settings. Prices are in INR and inclusive of all applicable charges (no separate GST line while the business is below the GST registration threshold)."
  }'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Sample categories (optional demo data - safe to keep or delete)
insert into categories (name, slug, description, sort_order) values
  ('Necklaces', 'necklaces', 'Chains, pendants, and statement collars.', 1),
  ('Earrings', 'earrings', 'Hoops, studs, drops, and everyday sparkle.', 2),
  ('Bracelets', 'bracelets', 'Cuffs, chains, and stackable pieces.', 3),
  ('Anklets', 'anklets', 'Delicate details for every step.', 4)
on conflict (slug) do nothing;
