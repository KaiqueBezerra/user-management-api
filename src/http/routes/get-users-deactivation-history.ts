import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import z from "zod";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const getDeactivationsHistoryRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/deactivation-history",
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: z.object({
          field: z.string().optional(),
        }),
      },
    },
    async (_request, reply) => {
      try {
        const result = await db.select().from(schema.user_deactivation_history);

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Get deactivated users error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
