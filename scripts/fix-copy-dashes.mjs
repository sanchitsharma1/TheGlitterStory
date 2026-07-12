import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function fix(text) {
  if (!text) return text;
  return text
    .replace(/\u2014|\u2013/g, "-") // em/en dash
    .replace(/\u201C|\u201D/g, '"') // curly double quotes
    .replace(/\u2018|\u2019/g, "'"); // curly single quotes
}

const { data: products, error } = await supabase
  .from("products")
  .select("id, slug, description, size_info");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let fixed = 0;
for (const p of products ?? []) {
  const description = fix(p.description);
  const size_info = fix(p.size_info);
  if (description !== p.description || size_info !== p.size_info) {
    const { error: upErr } = await supabase
      .from("products")
      .update({ description, size_info })
      .eq("id", p.id);
    if (upErr) console.error(p.slug, upErr.message);
    else {
      fixed++;
      console.log("fixed", p.slug);
    }
  }
}

console.log("products updated:", fixed);
