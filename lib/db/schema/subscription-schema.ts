import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/auth/auth-schema";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    plan: text("plan").default("free").notNull(),

    status: text("status").default("active").notNull(),

    startedAt: timestamp("started_at").defaultNow().notNull(),

    expiresAt: timestamp("expires_at"),

    ...timestamps,
  },
  (table) => [
    index("subscription_user_idx").on(table.userId),
    index("subscription_plan_idx").on(table.plan),
  ],
);
