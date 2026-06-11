/**
 * One-shot parser: reads Gemini-extracted question bank → writes seed-data.json
 *
 * Usage: tsx lib/db/seed/parse-gemini-export.ts
 * Input: question-bank-reference/gemini-code-1780602728763.txt
 * Output: lib/db/seed/seed-data.json (overwrites)
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fixed namespace UUID for deterministic v5-style IDs
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c4";

function uuidV5(name: string): string {
  const hash = createHash("sha1")
    .update(NAMESPACE + name)
    .digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "5" + hash.slice(13, 16),
    "8" + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

// ── Categories ──────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

const CATEGORY_HEADERS: [string, string][] = [
  ["HISTORIA", "Historia del Ecuador y Época Colonial"],
  ["GEOGRAFÍA", "Geografía, Territorio y Demografía"],
  ["CULTURA", "Cultura, Literatura, Arte y Símbolos Patrios"],
  ["INSTITUCIONES", "Instituciones, Leyes, Política y Constitución"],
  ["ECONOMÍA", "Economía, Deportes, Relaciones Internacionales y Actualidad"],
  ["COMPLEMENTARIAS", "Preguntas Complementarias"],
];

const categories: Category[] = CATEGORY_HEADERS.map(
  ([key, name], idx): Category => ({
    id: uuidV5("category:" + key),
    name,
    description: null,
    sortOrder: idx + 1,
  })
);

const CATEGORY_MAP: Record<string, string> = {};
for (const [key, name] of CATEGORY_HEADERS) {
  CATEGORY_MAP[key] = uuidV5("category:" + key);
}

// ── Parse questions ─────────────────────────────────────────────────────────

interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: string;
  text: string;
  categoryId: string;
  imageUrl: string | null;
  order: number;
  status: string;
  answers: Answer[];
}

const CATEGORY_ORDER = [
  "HISTORIA",
  "GEOGRAFÍA",
  "CULTURA",
  "INSTITUCIONES",
  "ECONOMÍA",
  "COMPLEMENTARIAS",
];

// Map section header keyword → category key
function detectCategory(line: string): string | null {
  const upper = line.toUpperCase();
  if (upper.includes("HISTORIA")) return "HISTORIA";
  if (upper.includes("GEOGRAF")) return "GEOGRAFÍA";
  if (upper.includes("CULTURA")) return "CULTURA";
  if (upper.includes("INSTITUCIONES") || upper.includes("LEYES"))
    return "INSTITUCIONES";
  if (upper.includes("ECONOM") || upper.includes("DEPORTES"))
    return "ECONOMÍA";
  if (upper.includes("COMPLEMENTARIAS")) return "COMPLEMENTARIAS";
  return null;
}

const geminiPath = resolve(
  __dirname,
  "..",
  "..",
  "..",
  "question-bank-reference",
  "gemini-code-1780602728763.txt"
);
const text = readFileSync(geminiPath, "utf-8");
const lines = text.split(/\r?\n/);

const questions: Question[] = [];
let currentCategory: string | null = null;

interface RawQuestion {
  text: string;
  options: string[];
  answerKey: string;
  catKey: string;
}

function parseRaw(raw: RawQuestion, catKey: string, qNum: number): Question {
  const qId = uuidV5("question:" + catKey + ":" + qNum);

  const isBoolean = raw.options.length === 2 &&
    (raw.options[0] === "Verdadero" || raw.options[0] === "V");
  const answerKey = raw.answerKey.replace(/^[\.\)\s]+/, "").trim();

  let answers: Answer[];

  if (isBoolean) {
    const correctIsVerdadero =
      answerKey.toUpperCase() === "VERDADERO" || answerKey === "V";
    answers = [
      {
        id: uuidV5("answer:" + qId + ":v"),
        questionId: qId,
        text: "Verdadero",
        isCorrect: correctIsVerdadero,
        order: 1,
      },
      {
        id: uuidV5("answer:" + qId + ":f"),
        questionId: qId,
        text: "Falso",
        isCorrect: !correctIsVerdadero,
        order: 2,
      },
    ];
  } else {
    const labelToLetter: Record<number, string> = { 0: "a", 1: "b", 2: "c", 3: "d" };
    answers = raw.options.map((opt, idx) => {
      const letter = labelToLetter[idx] || String.fromCharCode(97 + idx);
      const isCorrect = answerKey.toUpperCase() === letter.toUpperCase();
      return {
        id: uuidV5("answer:" + qId + ":" + letter),
        questionId: qId,
        text: opt,
        isCorrect,
        order: idx + 1,
      };
    });
  }

  return {
    id: qId,
    text: raw.text,
    categoryId: CATEGORY_MAP[catKey],
    imageUrl: null,
    order: qNum,
    status: "active",
    answers,
  };
}

// State machine
let raw: RawQuestion | null = null;
let qNum = 0;
let catKey: string | null = null;

for (const line of lines) {
  const trimmed = line.trim();

  // Detect category changes (only on section-header lines)
  if (/^[IVX]+\.\s/.test(trimmed)) {
    const detected = detectCategory(trimmed);
    if (detected) {
      catKey = detected;
      continue;
    }
  }

  // Detect question start
  const qMatch = trimmed.match(/^\[PREGUNTA\s*(\d+)\]\s*(.+)/i);
  if (qMatch) {
    if (raw && raw.catKey) {
      questions.push(parseRaw(raw, raw.catKey, qNum));
    }
    qNum = parseInt(qMatch[1], 10);
    raw = { text: qMatch[2].trim(), options: [], answerKey: "", catKey: catKey || "" };
    continue;
  }

  if (!raw) continue;

  // Option lines
  const optMatch = trimmed.match(/^[a-dA-D][\.\)]\s*(.+)/);
  if (optMatch && !trimmed.startsWith("[")) {
    raw.options.push(optMatch[1].trim());
    continue;
  }

  // Verdadero/Falso
  if (/^(Verdadero|Falso)$/i.test(trimmed) && !trimmed.startsWith("[")) {
    raw.options.push(trimmed);
    continue;
  }

  // Answer
  const ansMatch = trimmed.match(/^\[RESPUESTA\]\s*(.+)/i);
  if (ansMatch) {
    raw.answerKey = ansMatch[1].trim();
    continue;
  }
}

// Last question
if (raw && raw.catKey) {
  questions.push(parseRaw(raw, raw.catKey, qNum));
}

// ── Write output ────────────────────────────────────────────────────────────

const data = {
  categories,
  questions,
};

const outPath = resolve(__dirname, "seed-data.json");
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");

console.log(`\n  ✓ ${categories.length} categorías`);
console.log(`  ✓ ${questions.length} preguntas`);
console.log(`  ✓ ${questions.reduce((s, q) => s + q.answers.length, 0)} opciones`);
console.log(`\n✅ Written → seed-data.json`);
