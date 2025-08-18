import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const deleteDeactivationUserRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/api/users/:deactivatedId/deactivated",

    {
      preHandler: [authMiddleware],
      schema: {
        params: z.object({
          deactivatedId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { deactivatedId } = request.params;

      try {
        await db
          .delete(schema.deactivated_users)
          .where(eq(schema.deactivated_users.id, deactivatedId));

        return reply
          .status(200)
          .send({ message: "Deactivated user deleted successfully" });
      } catch (error) {
        console.error("Delete deactivated user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
