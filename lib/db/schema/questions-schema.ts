// ============================================================
// Drizzle ORM — Schema File
// ============================================================
//
// Each schema file defines tables using pgTable(). Drizzle
// reads ALL files matching the glob in drizzle.config.ts
// (currently "./lib/**/*-schema.ts") to generate migrations.
//
// ============================================================

// --- Column types ---
// pgTable:     creates a table definition
// uuid:        UUID column (uses PostgreSQL uuid type)
// text, integer, boolean, timestamp: basic column types
// index:       creates database indexes for faster queries
import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

// relations:  defines relationships BETWEEN tables (like Prisma relations)
// Allows you to do include/join queries with Drizzle's relational API
import { relations } from "drizzle-orm";
import { user } from "@/lib/auth/auth-schema";

// --- Helper timestamps pattern ---
// You'll see this a lot — createdAt + updatedAt on every table.
// $onUpdate() is a Drizzle hook: when you call db.update().set(...),
// it automatically sets this field to the current timestamp.
const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
};

// ============================================================
// TABLE: category
//
// pgTable("table_name_in_db", { columns }, [optional indexes])
// ============================================================
export const category = pgTable(
    "category",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        // uuid() = PostgreSQL UUID column
        // .defaultRandom() = auto-generates a UUID v4 on insert
        // .primaryKey() = marks it as primary key

        name: text("name").notNull().unique(),
        //.unique() Adds a UNIQUE constraint at the column level

        description: text("description"),
        // No .notNull() = column IS nullable (optional)

        sortOrder: integer("sort_order").default(0).notNull(),
        // .default(0) = if you don't provide a value, Drizzle uses 0

        ...timestamps,
        // Spreads createdAt + updatedAt into this table
    },
    // --- Table-level indexes ---
    // The second argument to pgTable is a callback that returns indexes.
    // This is where you put compound or custom indexes.
    (table) => [
        index("category_sort_idx").on(table.sortOrder),
        // Creates an index named "category_sort_idx" on the sort_order column
    ],
);

// ============================================================
// TABLE: question
//
// This table references category via a foreign key.
// ============================================================
export const question = pgTable(
    "question",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        text: text("text").notNull(),
        // The question text itself

        categoryId: uuid("category_id")
            .notNull()
            .references(() => category.id, { onDelete: "cascade" }),
        // .references() = FOREIGN KEY -> category(id)
        // The type matches — both are uuid now.
        // { onDelete: "cascade" }  = if the category is deleted, all its
        //   questions are also deleted. Other options:
        //   "set null" = set category_id to NULL on parent delete
        //   "restrict" = prevent deletion if questions exist
        //   "no action" = do nothing (PostgreSQL default)

        imageUrl: text("image_url"),
        // Optional image for the question

        order: integer("order").default(0).notNull(),

        status: text("status").default("active").notNull(),

        ...timestamps,
    },
    (table) => [
        index("question_category_idx").on(table.categoryId),
        // Index on the foreign key — speeds up queries that filter
        // by category (which you'll do a LOT)
        index("question_order_idx").on(table.order),
    ],
);

// ============================================================
// TABLE: answer_option
//
// Stores the multiple-choice options for each question.
// ============================================================
export const answerOption = pgTable(
    "answer_option",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        questionId: uuid("question_id")
            .notNull()
            .references(() => question.id, { onDelete: "cascade" }),

        text: text("text").notNull(),
        // The option text shown to the user

        isCorrect: boolean("is_correct").default(false).notNull(),
        // boolean() — true/false column

        order: integer("order").default(0).notNull(),

        ...timestamps,
    },
    (table) => [
        index("answer_option_question_idx").on(table.questionId),
    ],
);

// ============================================================
// TABLE: user_progress
//
// Tracks a user's answer to a specific question.
// ============================================================
export const userProgress = pgTable(
    "user_progress",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        questionId: uuid("question_id")
            .notNull()
            .references(() => question.id, { onDelete: "cascade" }),

        selectedOptionId: uuid("selected_option_id")
            .notNull()
            .references(() => answerOption.id, { onDelete: "cascade" }),

        isCorrect: boolean("is_correct").notNull(),

        answeredAt: timestamp("answered_at").defaultNow().notNull(),

        ...timestamps,
    },
    (table) => [
        // COMPOSITE index on (user_id, question_id) — speeds up
        // queries like "get all progress for user X"
        index("progress_user_idx").on(table.userId, table.questionId),
    ],
);

// ============================================================
// TABLE: user_question_assignment
//
// Locks in which questions are assigned to a user. Once assigned,
// the user always gets these same questions. 10 per free user.
// ============================================================
export const userQuestionAssignment = pgTable(
    "user_question_assignment",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        questionId: uuid("question_id")
            .notNull()
            .references(() => question.id, { onDelete: "cascade" }),

        sortOrder: integer("sort_order").default(0).notNull(),

        ...timestamps,
    },
    (table) => [
        index("assignment_user_idx").on(table.userId),
        index("assignment_user_question_idx").on(table.userId, table.questionId),
    ],
);

// ============================================================
// RELATIONS
//
// Drizzle relations let you query related data with the
// relational query API (like Prisma includes).
//
// Pattern:
//   export const relationName = relations(table, ({ one, many }) => ({
//     fieldName: one(many(targetTable), { fields: [localCol], references: [foreignCol] }),
//     fieldName: many(targetTable),
//   }));
// ============================================================

export const categoryRelations = relations(category, ({ many }) => ({
    // A category has MANY questions
    questions: many(question),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
    // A question BELONGS TO one category
    category: one(category, {
        fields: [question.categoryId],    // FK on THIS table
        references: [category.id],         // PK on the TARGET table
    }),
    // A question has MANY answer options
    answerOptions: many(answerOption),
}));

export const answerOptionRelations = relations(answerOption, ({ one }) => ({
    // Each answer option BELONGS TO one question
    question: one(question, {
        fields: [answerOption.questionId],
        references: [question.id],
    }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    question: one(question, {
        fields: [userProgress.questionId],
        references: [question.id],
    }),
    selectedOption: one(answerOption, {
        fields: [userProgress.selectedOptionId],
        references: [answerOption.id],
    }),
}));

export const userQuestionAssignmentRelations = relations(
    userQuestionAssignment,
    ({ one }) => ({
        question: one(question, {
            fields: [userQuestionAssignment.questionId],
            references: [question.id],
        }),
    }),
);

// ============================================================
// TYPE INFERENCE
//
// Drizzle automatically infers TypeScript types from your
// schema. You can export them for use in your app:
//
//   import { InferSelectModel, InferInsertModel } from "drizzle-orm";
//
//   export type Category = InferSelectModel<typeof category>;
//   // ^ { id: string, name: string, description: string | null,
//   //     sortOrder: number, createdAt: Date, updatedAt: Date }
//
//   export type NewCategory = InferInsertModel<typeof category>;
//   // ^ { id?: string, name: string, description?: string | null,
//   //     sortOrder?: number, createdAt?: Date, updatedAt?: Date }
//
// Note: uuid columns are typed as `string` in TypeScript,
// not as a special UUID type.
// ============================================================

// ============================================================
// QUERYING — Quick Reference
// ============================================================
//
// import { db } from "@/lib/db/drizzle";
// import { question, answerOption } from "@/lib/db/schema/questions-schema";
// import { eq } from "drizzle-orm";
//
// --- Basic queries ---
//   const all = await db.select().from(question);
//   const one = await db.select().from(question).where(eq(question.id, someUuid));
//
// --- Insert (id auto-generated via defaultRandom) ---
//   await db.insert(question).values({ text: "¿...?", categoryId: someCategoryId });
//
// --- Update ---
//   await db.update(question).set({ text: "..." }).where(eq(question.id, someUuid));
//
// --- Delete ---
//   await db.delete(question).where(eq(question.id, someUuid));
//
// --- Relations (eager loading via the relational API) ---
//  const q = await db.query.question.findMany({
//    with: {
//      category: true,
//      answerOptions: {
//        where: (opt, { eq }) => eq(opt.isCorrect, true),
//      },
//    },
//  });
//  // ^ Returns questions with their category + correct answer nested
//
// ============================================================
