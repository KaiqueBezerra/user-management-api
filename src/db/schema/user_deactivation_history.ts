import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const user_deactivation_history = pgTable(
  "user_deactivation_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Arrays de motivos e datas
    deactivation_reasons: text("deactivation_reasons")
      .array()
      .notNull()
      .default([]),
    deactivation_dates: timestamp("deactivation_dates", { withTimezone: true })
      .array()
      .notNull()
      .default([]),

    reactivation_reasons: text("reactivation_reasons").array().default([]),
    reactivation_dates: timestamp("reactivation_dates", { withTimezone: true })
      .array()
      .default([]),

    deactivations_by_admin: uuid("deactivations_by_admin")
      .array()
      .notNull()
      .default([]),

    reactivations_by_admin: uuid("reactivations_by_admin").array().default([]),
  },
  (t) => [uniqueIndex("uq_user_deactivation_history_user_id").on(t.user_id)]
);
