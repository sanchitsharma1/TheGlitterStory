/**
 * Seed sample jewellery products for The Jewel Nest demo catalog.
 * Usage: node scripts/seed-sample-products.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// High-quality jewellery photos (Unsplash - already allowed in next.config)
const img = {
  pearlNeck:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
  goldChain:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  pendant:
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
  hoops:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  studs:
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80",
  drops:
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80",
  bracelet:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  cuff:
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
  stack:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
  anklet:
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
  delicate:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  layered:
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80",
};

const samples = (cat) => [
  {
    title: "Luna Pearl Strand",
    slug: "luna-pearl-strand",
    description:
      "A soft strand of luminous faux pearls with a discreet gold-tone clasp. Made for office days, dinner dates, and everything in between - the kind of piece that finishes a look without shouting.\n\nCare: wipe with a soft dry cloth. Avoid perfume and water.",
    size_info: "Approx. 42 cm + 5 cm extender",
    price: 899,
    compare_at_price: 1199,
    stock: 12,
    category_id: cat.necklaces,
    images: [img.pearlNeck, img.layered],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Gilded Rope Chain",
    slug: "gilded-rope-chain",
    description:
      "A textured rope chain in warm gold tone - substantial enough to wear alone, refined enough to layer. Everyday glam, Instagram-ready.\n\nFrom the house of The Glitter Story: polish for your neckline.",
    size_info: "Approx. 45 cm",
    price: 749,
    compare_at_price: null,
    stock: 18,
    category_id: cat.necklaces,
    images: [img.goldChain],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Nest Pendant Mini",
    slug: "nest-pendant-mini",
    description:
      "Our signature tiny nest motif on a fine chain - a quiet nod to The Jewel Nest. Lightweight, gift-ready, and designed to sit close to the collarbone.",
    size_info: "Chain 40 cm + 5 cm extender · Pendant ~1.2 cm",
    price: 649,
    compare_at_price: 799,
    stock: 8,
    category_id: cat.necklaces,
    images: [img.pendant, img.goldChain],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Aurora Hoops",
    slug: "aurora-hoops",
    description:
      "Medium gold-tone hoops with a soft brushed finish. Catch the light without catching on your hair - ideal for reels, brunches, and salon days at The Glitter Story.",
    size_info: "Approx. 3.5 cm diameter · Lightweight",
    price: 549,
    compare_at_price: null,
    stock: 20,
    category_id: cat.earrings,
    images: [img.hoops],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Dewdrop Studs",
    slug: "dewdrop-studs",
    description:
      "Tiny crystal-kissed studs that read as \"I woke up like this\" elegance. Hypoallergenic posts for all-day comfort.\n\nHygiene note: earrings are exchange-only once unsealed.",
    size_info: "Stone ~6 mm",
    price: 399,
    compare_at_price: 499,
    stock: 25,
    category_id: cat.earrings,
    images: [img.studs],
    is_active: true,
    is_featured: false,
    low_stock_threshold: 5,
  },
  {
    title: "Cascade Drop Earrings",
    slug: "cascade-drop-earrings",
    description:
      "Elongated drops with layered links - movement in every frame. Pair with an open neckline or a sleek bun.",
    size_info: "Drop length approx. 6 cm",
    price: 799,
    compare_at_price: null,
    stock: 0, // demo SOLD state
    category_id: cat.earrings,
    images: [img.drops],
    is_active: true,
    is_featured: false,
    low_stock_threshold: 3,
  },
  {
    title: "Silk Link Bracelet",
    slug: "silk-link-bracelet",
    description:
      "Fluid links that drape like silk against the wrist. Closes with a secure lobster clasp. Stack with a watch or wear solo.",
    size_info: "Inner length approx. 17 cm + 3 cm extender",
    price: 699,
    compare_at_price: 899,
    stock: 10,
    category_id: cat.bracelets,
    images: [img.bracelet, img.stack],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Matte Cuff Band",
    slug: "matte-cuff-band",
    description:
      "A modern open cuff in matte gold tone - architectural, minimal, and surprisingly comfortable. No clasp: slide on and go.",
    size_info: "Open cuff · fits most wrists 14-17 cm",
    price: 999,
    compare_at_price: null,
    stock: 6,
    category_id: cat.bracelets,
    images: [img.cuff],
    is_active: true,
    is_featured: false,
    low_stock_threshold: 2,
  },
  {
    title: "Trio Stack Set",
    slug: "trio-stack-set",
    description:
      "Three fine bracelets sold as a set - mix metals in one story. Designed to stack with zero fuss.",
    size_info: "Each ~16-18 cm adjustable",
    price: 1199,
    compare_at_price: 1499,
    stock: 2, // low stock demo
    category_id: cat.bracelets,
    images: [img.stack, img.bracelet],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Barefoot Gleam Anklet",
    slug: "barefoot-gleam-anklet",
    description:
      "A delicate anklet with a single glint charm. Perfect for festive wear, beach evenings, or peeping under trousers.",
    size_info: "Approx. 22 cm + 4 cm extender",
    price: 449,
    compare_at_price: null,
    stock: 15,
    category_id: cat.anklets,
    images: [img.anklet],
    is_active: true,
    is_featured: false,
    low_stock_threshold: 3,
  },
  {
    title: "Coin Charm Anklet",
    slug: "coin-charm-anklet",
    description:
      "Tiny coin charms that catch every step. Adjustable so it sits just right - soft jingle, loud confidence.",
    size_info: "Adjustable 21-26 cm",
    price: 529,
    compare_at_price: 649,
    stock: 9,
    category_id: cat.anklets,
    images: [img.anklet, img.delicate],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
  {
    title: "Evening Layer Necklace",
    slug: "evening-layer-necklace",
    description:
      "Pre-layered dual chain with a subtle centre drop - no styling required. Your shortcut to \"done\" for dinners and celebrations.",
    size_info: "Shorter layer ~38 cm · longer ~45 cm",
    price: 1099,
    compare_at_price: 1399,
    stock: 7,
    category_id: cat.necklaces,
    images: [img.layered, img.pendant],
    is_active: true,
    is_featured: true,
    low_stock_threshold: 3,
  },
];

async function main() {
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug");

  if (catErr || !categories?.length) {
    console.error("Categories missing. Run supabase/seed.sql first.", catErr);
    process.exit(1);
  }

  const cat = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const products = samples(cat);

  // Upsert by slug so re-running is safe
  let ok = 0;
  let failed = 0;

  for (const p of products) {
    const { error } = await supabase.from("products").upsert(p, {
      onConflict: "slug",
    });
    if (error) {
      console.error("FAIL", p.slug, error.message);
      failed++;
    } else {
      console.log("OK  ", p.slug, `₹${p.price}`, p.stock === 0 ? "(SOLD)" : `stock=${p.stock}`);
      ok++;
    }
  }

  // Optional: notify admin that sold-out sample exists
  await supabase.from("admin_notifications").insert({
    type: "system",
    title: "Sample catalog seeded",
    message:
      "Demo products are live on the storefront. Cascade Drop Earrings is SOLD (stock 0) for UI testing. Replace images with your own when ready.",
    meta: { source: "seed-sample-products" },
  });

  console.log(`\nDone: ${ok} products upserted, ${failed} failed.`);
  console.log("Open http://localhost:3000/shop to view.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
