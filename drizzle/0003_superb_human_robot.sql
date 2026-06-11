CREATE TABLE "user_question_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_question_assignment" ADD CONSTRAINT "user_question_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_assignment" ADD CONSTRAINT "user_question_assignment_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignment_user_idx" ON "user_question_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assignment_user_question_idx" ON "user_question_assignment" USING btree ("user_id","question_id");