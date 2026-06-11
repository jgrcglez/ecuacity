import "dotenv/config";
import { db } from "../drizzle";
import {
  category,
  question,
  answerOption,
} from "../schema/questions-schema";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface SeedCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface SeedAnswer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface SeedQuestion {
  id: string;
  text: string;
  categoryId: string;
  imageUrl: string | null;
  order: number;
  status: string;
  answers: SeedAnswer[];
}

interface SeedData {
  categories: SeedCategory[];
  questions: SeedQuestion[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(__dirname, "seed-data.json");

let seedData: SeedData;
try {
  seedData = JSON.parse(readFileSync(jsonPath, "utf-8")) as SeedData;
} catch {
  console.error("❌ seed-data.json not found. Generate it by running:");
  console.error("   npm run db:seed:export");
  console.error("   (requires a running database with data)");
  process.exit(1);
}

async function main() {
  console.log("🌱 Seeding questions database...\n");

  const { categories: categoryValues, questions: questionValues } = seedData;

  // ── Categories ────────────────────────────────────────────
  for (const row of categoryValues) {
    await db.insert(category).values(row).onConflictDoUpdate({
      target: category.id,
      set: {
        name: sql`EXCLUDED.name`,
        description: sql`EXCLUDED.description`,
        sortOrder: sql`EXCLUDED.sort_order`,
      },
    });
  }
  console.log(`  ✓ ${categoryValues.length} categorías`);

  // ── Questions + answers ───────────────────────────────────
  let qCount = 0;
  let aCount = 0;

  for (const q of questionValues) {
    await db.insert(question).values({
      id: q.id,
      text: q.text,
      categoryId: q.categoryId,
      imageUrl: q.imageUrl ?? null,
      order: q.order,
      status: q.status ?? "active",
    }).onConflictDoUpdate({
      target: question.id,
      set: {
        text: sql`EXCLUDED.text`,
        categoryId: sql`EXCLUDED.category_id`,
        imageUrl: sql`EXCLUDED.image_url`,
        order: sql`EXCLUDED.order`,
        status: sql`EXCLUDED.status`,
      },
    });
    qCount++;

    for (const a of q.answers) {
      await db.insert(answerOption).values({
        id: a.id,
        questionId: a.questionId,
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order,
      }).onConflictDoUpdate({
        target: answerOption.id,
        set: {
          text: sql`EXCLUDED.text`,
          isCorrect: sql`EXCLUDED.is_correct`,
          order: sql`EXCLUDED.order`,
        },
      });
      aCount++;
    }
  }

  console.log(`  ✓ ${qCount} preguntas`);
  console.log(`  ✓ ${aCount} opciones de respuesta`);
  console.log("\n✅ Seed complete");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
