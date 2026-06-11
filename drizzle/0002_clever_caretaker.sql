CREATE TABLE "youtube_video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"youtube_url" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "youtube_video_sort_idx" ON "youtube_video" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "youtube_video_active_idx" ON "youtube_video" USING btree ("active");