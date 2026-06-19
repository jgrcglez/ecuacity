import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const contactMessage = pgTable(
  "contact_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),

    read: boolean("read").default(false).notNull(),

    isTestimonial: boolean("is_testimonial").default(false).notNull(),
    testimonialPublished: boolean("testimonial_published").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("contact_created_idx").on(table.createdAt),
    index("contact_read_idx").on(table.read),
    index("contact_published_idx").on(table.testimonialPublished),
  ],
);

export type ContactMessage = typeof contactMessage.$inferSelect;
export type NewContactMessage = typeof contactMessage.$inferInsert;
