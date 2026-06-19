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

  // ── Truncate existing data (order matters for FK constraints) ─
  await db.execute(sql`TRUNCATE TABLE answer_option, question, category RESTART IDENTITY CASCADE`);
  console.log("  ✓ Tablas truncadas");

  // ── Categories ────────────────────────────────────────────
  await db.insert(category).values(categoryValues);
  console.log(`  ✓ ${categoryValues.length} categorías`);

  // ── Questions (batch) ─────────────────────────────────────
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
    );
  }
  console.log(`  ✓ ${questionValues.length} preguntas`);

  // ── Answer options (batch) ────────────────────────────────
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
    await db.insert(answerOption).values(allAnswers.slice(i, i + BATCH));
  }
  console.log(`  ✓ ${allAnswers.length} opciones de respuesta`);
  console.log("\n✅ Seed complete");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
