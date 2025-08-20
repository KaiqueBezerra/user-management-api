ALTER TABLE "user_deactivation_history" RENAME TO "users_deactivation_history";--> statement-breakpoint
ALTER TABLE "users_deactivation_history" DROP CONSTRAINT "user_deactivation_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_deactivation_history" ADD CONSTRAINT "users_deactivation_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;