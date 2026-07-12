# Locked product decisions — The Jewel Nest

## Brand
- Name: **The Jewel Nest**
- Domain: thejewelnest.co.in
- Instagram: @thejewel_nest
- Parent brand: **The Glitter Story** (nail salon) — jewellery arm of the same house
- Theme: light ivory, muted gold, matte black
- Logo: SVG monogram nest + wordmark (`public/brand/`)

## Commerce
- Currency: INR, prices inclusive (no GST line while under threshold)
- Shipping India only: free ≥ ₹600, else ₹120
- Payments: COD + Razorpay (Razorpay keys optional at launch)
- COD minimum: ₹299
- Guest checkout only (customer accounts later)
- Stock 0: hard block, SOLD UI, admin notification

## Products
- No ring sizes required for now
- Optional `size_info` field for measurements in description area
- Multi-image products, categories, sale via compare-at price

## Admin
- Super admin: full control including staff + settings
- Staff: granular permissions
- Return window days editable in Settings
- Coupons: code, %/fixed, category/product/all, validity, usage cap

## Tech
- Next.js + Vercel + Supabase + Razorpay + Resend (later)
- English only
