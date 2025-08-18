import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { and, eq, exists, isNull } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const getDeactivatedUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users/deactivated",
    { preHandler: [authMiddleware] },
    async (_request, reply) => {
      try {
        const result = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            created_at: schema.users.created_at,
            updated_at: schema.users.updated_at,
          })
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
    }
  );
};
