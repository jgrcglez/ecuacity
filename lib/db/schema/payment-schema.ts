import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/auth/auth-schema";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
};

export const payment = pgTable(
  "payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    transactionId: text("transaction_id").notNull(),
    clientTransactionId: text("client_transaction_id").notNull(),

    amount: integer("amount").notNull(),                     // gross in cents
    commission: integer("commission").notNull().default(0),   // Payphone fee in cents
    netAmount: integer("net_amount").notNull(),               // what we receive in cents

    status: text("status").notNull().default("approved"),     // approved | canceled
    reference: text("reference"),
    cardBrand: text("card_brand"),
    cardType: text("card_type"),
    authorizationCode: text("authorization_code"),

    ...timestamps,
  },
  (table) => [
    index("payment_user_idx").on(table.userId),
    index("payment_created_idx").on(table.createdAt),
  ],
);

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;
