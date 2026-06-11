import "dotenv/config";
import { db } from "../drizzle";
import { category as categoryTable, question as questionTable, answerOption } from "../schema/questions-schema";
import { asc } from "drizzle-orm";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  console.log("Exporting database to seed-data.json...\n");

  const categories = await db.select().from(categoryTable).orderBy(asc(categoryTable.sortOrder));

  const questionRows = await db
    .select({
      id: questionTable.id,
      text: questionTable.text,
      categoryId: questionTable.categoryId,
      order: questionTable.order,
      imageUrl: questionTable.imageUrl,
      status: questionTable.status,
    })
    .from(questionTable)
    .orderBy(questionTable.order);

  const answerRows = await db
    .select()
    .from(answerOption)
    .orderBy(answerOption.order);

  const answersByQuestion: Record<string, typeof answerRows> = {};
  for (const a of answerRows) {
    (answersByQuestion[a.questionId] ??= []).push(a);
  }

  const data = {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
    })),
    questions: questionRows.map((q) => ({
      id: q.id,
      text: q.text,
      categoryId: q.categoryId,
      imageUrl: q.imageUrl,
      order: q.order,
      status: q.status,
      answers: (answersByQuestion[q.id] ?? []).map((a) => ({
        id: a.id,
        questionId: a.questionId,
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order,
      })),
    })),
  };

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, "seed-data.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`  ✓ ${data.categories.length} categorías`);
  console.log(`  ✓ ${data.questions.length} preguntas`);
  console.log(`  ✓ ${answerRows.length} opciones de respuesta`);
  console.log(`\n✅ Export complete → seed-data.json`);
}

main().catch((err) => {
  console.error("❌ Export failed:", err);
  process.exit(1);
});
