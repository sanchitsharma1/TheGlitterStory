# Email setup for The Jewel Nest

Public mailbox: **support@thejewelnest.co.in** (GoDaddy)

There are **two different jobs** email does. Do both.

---

## 1) Receiving customer mail (you read replies)

**Recommended:** Keep `support@thejewelnest.co.in` active on GoDaddy, and **forward** a copy to your personal Gmail.

### Why this is best
- Customers always write to a professional brand address
- You can still read/reply from Gmail on your phone
- You do not mix business forever only inside personal Gmail

### GoDaddy steps (typical)
1. GoDaddy → Email & Office Dashboard → your mailbox  
2. Open **support@thejewelnest.co.in** settings  
3. Enable **Forwarding** → your personal Gmail  
4. (Optional) Keep a copy in GoDaddy inbox  

### Optional: reply from Gmail as support@
In Gmail → Settings → Accounts → **Send mail as** → add `support@thejewelnest.co.in`  
Use GoDaddy SMTP settings if Gmail asks (GoDaddy shows these under email client setup).

**Do not** only use personal Gmail as the public contact. Keep `support@` as the face of the brand.

---

## 2) Sending order emails from the website (automated)

The website should **not** send order mail through Gmail login.  
Gmail SMTP breaks easily (limits, app passwords, spam).

We use **[Resend](https://resend.com)** (free tier is enough early on):

| Email | When |
|-------|------|
| Customer order confirmation + Order ID | After COD order is placed |
| Admin alert to support@ | Same moment (new order) |
| Customer status update | When you set Confirmed / Packed / Shipped / Delivered / Cancelled / Refunded in admin |

From address: `The Jewel Nest <support@thejewelnest.co.in>`

### Resend setup (about 15 minutes)
1. Create account at https://resend.com  
2. **Domains** → Add `thejewelnest.co.in`  
3. Resend shows DNS records (SPF, DKIM, maybe DMARC)  
4. In **GoDaddy DNS** for thejewelnest.co.in, add those records exactly  
5. Wait for Resend to show domain **Verified** (can take a few minutes to a few hours)  
6. Create an API key in Resend  
7. Put in `.env.local` and later Vercel:

```env
RESEND_API_KEY=re_xxxxxxxx
ORDER_FROM_EMAIL=The Jewel Nest <support@thejewelnest.co.in>
SUPPORT_EMAIL=support@thejewelnest.co.in
NEXT_PUBLIC_SITE_URL=https://thejewelnest.co.in
```

8. Restart `npm run dev` and place a **test COD order** to your own email.

### Important GoDaddy DNS note
Do not delete existing MX records for GoDaddy email when adding Resend records.  
Resend only needs the SPF/DKIM (and optional DMARC) records it shows - keep mailbox MX intact so you still **receive** mail.

---

## Quick decision guide

| Goal | What to do |
|------|------------|
| Customers email you | Use **support@** (forward to Gmail) |
| You read mail on phone | Gmail via forward |
| Website sends order IDs | **Resend** + domain verify |
| "Only Gmail, no support@" | Not recommended for a store |

---

## After you have the Resend API key

1. Paste `RESEND_API_KEY` into `.env.local`  
2. Tell your developer (or restart the app)  
3. Place a test order  
4. Confirm:
   - Customer inbox got confirmation  
   - support@ (or Gmail forward) got admin new-order alert  

Then add the same env vars on Vercel when you deploy.
