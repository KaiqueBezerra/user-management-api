import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import z from "zod";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const getUsersByIdRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users/:userId",
    {
      preHandler: [authMiddleware],
      schema: {
        params: z.object({
          userId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params;

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
          .where(eq(schema.users.id, userId));

        if (result.length === 0) {
          return reply.status(404).send({ message: "User not found" });
        }

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Get user by id error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
