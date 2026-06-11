import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const youtubeVideo = pgTable(
  "youtube_video",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: text("title").notNull(),

    youtubeUrl: text("youtube_url").notNull(),

    description: text("description"),

    sortOrder: integer("sort_order").default(0).notNull(),

    active: boolean("active").default(true).notNull(),

    ...timestamps,
  },
  (table) => [
    index("youtube_video_sort_idx").on(table.sortOrder),
    index("youtube_video_active_idx").on(table.active),
  ],
);
