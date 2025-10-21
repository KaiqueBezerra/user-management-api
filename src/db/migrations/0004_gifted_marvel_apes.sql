ALTER TABLE "deactivated_users" DROP CONSTRAINT "deactivated_users_deactivated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "deactivated_users" DROP CONSTRAINT "deactivated_users_reactivated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_deactivation_history" DROP CONSTRAINT "users_deactivation_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "deactivated_users" ADD CONSTRAINT "deactivated_users_deactivated_by_users_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deactivated_users" ADD CONSTRAINT "deactivated_users_reactivated_by_users_id_fk" FOREIGN KEY ("reactivated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_deactivation_history" ADD CONSTRAINT "users_deactivation_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;