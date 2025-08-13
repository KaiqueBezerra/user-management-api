import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const deactivated_users = pgTable("deactivated_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  deactivated_reason: text("deactivated_reason").notNull(),
  reactivated_reason: text("reactivated_reason"),
  deactivated_at: timestamp("deactivated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  reactivated_at: timestamp("reactivated_at", { withTimezone: true }),
  deactivated_by: uuid("deactivated_by")
    .references(() => users.id)
    .notNull(),
  reactivated_by: uuid("reactivated_by").references(() => users.id),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});
