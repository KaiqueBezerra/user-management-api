import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const deleteUserRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
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
        await db.delete(schema.users).where(eq(schema.users.id, userId));

        return reply.status(200).send({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Delete user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
