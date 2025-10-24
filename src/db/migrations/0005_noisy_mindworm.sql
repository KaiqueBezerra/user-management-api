ALTER TABLE "users_deactivation_history" ALTER COLUMN "deactivations_by_admin" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "users_deactivation_history" ALTER COLUMN "deactivations_by_admin" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users_deactivation_history" ALTER COLUMN "reactivations_by_admin" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "users_deactivation_history" ALTER COLUMN "reactivations_by_admin" SET DEFAULT '{}';