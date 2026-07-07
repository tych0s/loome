/**
 * Migration runner. Applies migrations/*.sql in order, tracked in a
 * `_migrations` ledger table. Runs through the transaction pooler
 * (postgres-js with prepare: false), executed at service start:
 *
 *   DATABASE_URL=... node --experimental-strip-types src/migrate.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

/**
 * Objects owned by these migrations. Dropped only when the ledger table is
 * missing: that state can only mean a pre-ledger attempt stalled halfway,
 * and is impossible once the first run has committed the ledger.
 */
const OWNED_TABLES = [
  "users",
  "npcs",
  "cycles",
  "messages",
  "proposals",
  "votes",
  "agent_runs",
  "settings",
  "audit_log",
];
const OWNED_TYPES = [
  "user_role",
  "npc_status",
  "cycle_phase",
  "cycle_status",
  "author_type",
  "proposal_kind",
  "proposal_status",
  "voter_type",
  "run_state",
];

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("error: DATABASE_URL is required");
  process.exit(2);
}

const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 20 });

const ledger = (await sql.unsafe(
  "select 1 from information_schema.tables where table_schema = 'public' and table_name = '_migrations'",
)) as unknown[];
if (ledger.length === 0) {
  console.log("no migration ledger — clearing partial pre-ledger objects");
  for (const table of OWNED_TABLES) {
    await sql.unsafe(`drop table if exists "${table}" cascade`);
  }
  for (const type of OWNED_TYPES) {
    await sql.unsafe(`drop type if exists "${type}" cascade`);
  }
  await sql.unsafe(
    "create table _migrations (name text primary key, applied_at timestamptz not null default now())",
  );
}

const appliedRows = (await sql.unsafe(
  "select name from _migrations",
)) as Array<{ name: string }>;
const applied = new Set(appliedRows.map((row) => row.name));

const files = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const statements = readFileSync(join(MIGRATIONS_DIR, file), "utf8").split(
    "--> statement-breakpoint",
  );
  console.log(`applying ${file} (${statements.length} statements)`);
  await sql.begin(async (tx) => {
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) await tx.unsafe(trimmed);
    }
    await tx.unsafe("insert into _migrations (name) values ($1)", [file]);
  });
  console.log(`applied ${file}`);
}

console.log(`migrations up to date (${files.length} file(s))`);
await sql.end();
