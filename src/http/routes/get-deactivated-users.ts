import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { and, eq, exists, isNull } from "drizzle-orm";

export const getDeactivatedUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get("/api/users/deactivated", async (request, reply) => {
    try {
      const result = await db
        .select()
        .from(schema.users)
        .where(
          exists(
            db
              .select()
              .from(schema.deactivated_users)
              .where(
                and(
                  eq(schema.deactivated_users.user_id, schema.users.id),
                  isNull(schema.deactivated_users.reactivated_at)
                )
              )
          )
        );

      return reply.status(200).send(result);
    } catch (error) {
      console.error("Get deactivated users error:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });
};
