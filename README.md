# The Jewel Nest

Modern jewellery e-commerce storefront + admin for **thejewelnest.co.in**.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase · Razorpay · Vercel

---

## Features

### Storefront
- Premium light / gold / matte-black theme
- Shop, product detail, cart, guest checkout (no customer login)
- COD + Razorpay online payment
- Shipping: free above ₹600, else ₹120 (editable in admin)
- Coupons, sale prices (compare-at MRP), stock hard-block with **SOLD** state
- Order confirmation page with **Order ID** (`TJN-…`)
- About story linking **The Glitter Story** (parent brand) → **The Jewel Nest**
- Legal pages (shipping, returns, privacy, terms) with admin-editable copy
- Instagram `@thejewel_nest`

### Admin (`/admin`)
- Super admin + staff roles with permission flags
- Dashboard (revenue, orders, low stock, alerts)
- Categories, products (multi-image upload), inventory
- Orders + status workflow
- Coupons (all / category / product, % or fixed, validity, usage limits)
- Settings: shipping rules, COD min, **return window days**, contact, policies
- Notifications: sold out, low stock, new orders

---

## Free hosting plan (initial stage)

| Piece | Free service |
|-------|----------------|
| App | **Vercel** Hobby |
| DB + Auth + Image storage | **Supabase** Free |
| Payments | **Razorpay** (pay-per-transaction) |
| Domain | Your **thejewelnest.co.in** → point DNS to Vercel |

---

## Local setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → run `supabase/schema.sql`
3. Run `supabase/seed.sql`
4. Project Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only, never expose**)

### 3. Super admin user

1. Supabase → Authentication → Users → **Add user** (auto-confirm ON)
2. Copy user UUID
3. Edit and run `supabase/bootstrap_super_admin.sql`

### 4. Run

```bash
npm run dev
```

- Store: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

### 5. Deploy to Vercel

1. Push repo to GitHub
2. Import on Vercel → add the same env vars
3. Domain → add `thejewelnest.co.in` → set DNS records Vercel shows

---

## Commerce rules (defaults)

| Rule | Value |
|------|--------|
| Free shipping | Orders ≥ ₹600 |
| Shipping fee | ₹120 below threshold |
| COD minimum | ₹299 |
| Region | India only |
| Tax | Prices inclusive (no GST line for now) |
| Stock at 0 | Hard block, greyscale **SOLD**, admin alert |

---

## Sale & coupon logic (defaults)

**Sale**
- Set **Selling price** = what customer pays
- Set **Compare-at / MRP** higher than selling price → shows strikethrough + % off
- Optional sale start/end datetime on the product

**Coupon**
- Code, % or fixed ₹ off
- Scope: entire cart / one category / one product
- Min order, max uses, start/expiry dates
- Validated on the server at checkout (never trust the browser)

---

## Email (order confirmations)

Use **support@thejewelnest.co.in** as the public address.  
See **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)** for GoDaddy + Gmail + Resend.

```env
RESEND_API_KEY=re_...
ORDER_FROM_EMAIL=The Jewel Nest <support@thejewelnest.co.in>
SUPPORT_EMAIL=support@thejewelnest.co.in
```

## Razorpay (later)

You can launch with **COD only**. When ready:

1. Sign up at [razorpay.com](https://razorpay.com) (business details, bank account, PAN, etc.)
2. Get **Key ID** + **Key Secret** from Dashboard → API Keys
3. Add to env:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

4. Tell your developer (or me) those two values (never commit the secret to git)
5. Switch to **live** keys after Razorpay activates your account

What to send me for integration (when ready):
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` (via secure channel, not public chat if possible)
- Confirm test vs live mode

---

## Brand

- Logo: `public/brand/logo.svg`
- Mark / favicon: `public/brand/mark.svg`
- Parent brand narrative: **The Glitter Story** (nail salon) → jewellery house **The Jewel Nest**

---

## Project scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

---

## Security notes

- Service role key only on the server (Vercel env)
- Prices, stock, and coupons re-validated server-side
- Stock decremented atomically (`decrement_stock` RPC)
- Admin routes require active `staff_profiles` row
- Card data never touches your servers (Razorpay)
