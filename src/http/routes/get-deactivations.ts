import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const getDeactivationsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/deactivations",
    { preHandler: [authMiddleware] },
    async (_request, reply) => {
      try {
        const result = await db.select().from(schema.deactivated_users);

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Get deactivations error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
