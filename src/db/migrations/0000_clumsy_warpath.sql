CREATE TABLE "deactivated_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deactivated_reason" text NOT NULL,
	"reactivated_reason" text,
	"deactivated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reactivated_at" timestamp with time zone,
	"deactivated_by" uuid NOT NULL,
	"reactivated_by" uuid,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_deactivation_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"deactivation_reasons" text[] DEFAULT '{}' NOT NULL,
	"deactivation_dates" timestamp with time zone[] DEFAULT '{}' NOT NULL,
	"reactivation_reasons" text[] DEFAULT '{}',
	"reactivation_dates" timestamp with time zone[] DEFAULT '{}',
	"deactivations_by_admin" uuid[] DEFAULT '{}' NOT NULL,
	"reactivations_by_admin" uuid[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "deactivated_users" ADD CONSTRAINT "deactivated_users_deactivated_by_users_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deactivated_users" ADD CONSTRAINT "deactivated_users_reactivated_by_users_id_fk" FOREIGN KEY ("reactivated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deactivated_users" ADD CONSTRAINT "deactivated_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deactivation_history" ADD CONSTRAINT "user_deactivation_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_deactivation_history_user_id" ON "user_deactivation_history" USING btree ("user_id");