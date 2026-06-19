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

  // ── Categories (upsert) ──────────────────────────────────
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

  // ── Questions (batch upsert) ─────────────────────────────
  const BATCH = 50;
  for (let i = 0; i < questionValues.length; i += BATCH) {
    const batch = questionValues.slice(i, i + BATCH);
    await db.insert(question).values(
      batch.map(q => ({
        id: q.id,
        text: q.text,
        categoryId: q.categoryId,
        imageUrl: q.imageUrl ?? null,
        order: q.order,
        status: q.status ?? "active",
      }))
    ).onConflictDoUpdate({
      target: question.id,
      set: {
        text: sql`EXCLUDED.text`,
        categoryId: sql`EXCLUDED.category_id`,
        imageUrl: sql`EXCLUDED.image_url`,
        order: sql`EXCLUDED.order`,
        status: sql`EXCLUDED.status`,
      },
    });
  }
  console.log(`  ✓ ${questionValues.length} preguntas`);

  // ── Answer options (batch upsert) ────────────────────────
  const allAnswers = questionValues.flatMap(q =>
    q.answers.map(a => ({
      id: a.id,
      questionId: a.questionId,
      text: a.text,
      isCorrect: a.isCorrect,
      order: a.order,
    }))
  );

  for (let i = 0; i < allAnswers.length; i += BATCH) {
    await db.insert(answerOption).values(allAnswers.slice(i, i + BATCH)).onConflictDoUpdate({
      target: answerOption.id,
      set: {
        text: sql`EXCLUDED.text`,
        isCorrect: sql`EXCLUDED.is_correct`,
        order: sql`EXCLUDED.order`,
      },
    });
  }
  console.log(`  ✓ ${allAnswers.length} opciones de respuesta`);
  console.log("\n✅ Seed complete");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
