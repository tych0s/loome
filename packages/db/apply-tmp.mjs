import { readFileSync, readdirSync } from "node:fs";
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 15 });
const files = readdirSync("migrations").filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  const raw = readFileSync(`migrations/${file}`, "utf8");
  const statements = raw.split("--> statement-breakpoint");
  console.log(`aplicando ${file} (${statements.length} statements)...`);
  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed) await sql.unsafe(trimmed);
  }
}
const rows = await sql.unsafe("select table_name from information_schema.tables where table_schema = public order by table_name");
console.log("tablas:", rows.map((r) => r.table_name).join(", "));
await sql.end();
