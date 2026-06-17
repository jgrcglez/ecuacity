CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"client_transaction_id" text NOT NULL,
	"amount" integer NOT NULL,
	"commission" integer DEFAULT 0 NOT NULL,
	"net_amount" integer NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"reference" text,
	"card_brand" text,
	"card_type" text,
	"authorization_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_user_idx" ON "payment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_created_idx" ON "payment" USING btree ("created_at");