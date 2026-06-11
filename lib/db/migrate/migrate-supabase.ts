/**
 * Run pending Drizzle migrations on Supabase.
 *
 * Usage: npm run db:migrate:supabase
 *
 * Reads DATABASE_URL from .env.supabase (project root, gitignored),
 * then applies all migration SQL files from drizzle/.
 */
import { readFileSync, existsSync } from "fs";
import { readdirSync } from "fs";
import { resolve } from "path";
import { parse } from "dotenv";
import { Client } from "pg";

const ROOT = resolve(__dirname, "..", "..", "..");
const SUPABASE_ENV = resolve(ROOT, ".env.supabase");

async function main() {
  // Load Supabase credentials
  if (!existsSync(SUPABASE_ENV)) {
    console.error("❌ .env.supabase not found. Create it with:");
    console.error("   DATABASE_URL=postgresql://...");
    process.exit(1);
  }

  const env = parse(readFileSync(SUPABASE_ENV, "utf-8"));
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set in .env.supabase");
    process.exit(1);
  }

  // Find all migration SQL files sorted by name
  const drizzleDir = resolve(ROOT, "drizzle");
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  console.log(`Found ${files.length} migration(s):`);
  files.forEach((f) => console.log(`  ${f}`));

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(resolve(drizzleDir, file), "utf-8");
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        try {
          await client.query(stmt);
        } catch (e: any) {
          // Skip "already exists" errors — idempotent
          if (
            e.message?.includes("already exists") ||
            e.message?.includes("duplicate column")
          ) {
            console.log(`  ⏭ Skipped (already applied): ${stmt.slice(0, 60)}...`);
          } else {
            throw e;
          }
        }
      }
      console.log(`  ✓ ${file}`);
    }
    console.log("\n✅ All migrations applied!");
  } catch (e: any) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
