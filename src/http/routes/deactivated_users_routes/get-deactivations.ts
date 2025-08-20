import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import z from "zod";

export const getDeactivationsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/deactivations",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Deactivated Users"],
        summary: "Get deactivations",
        description: "Get a list of all deactivations.",
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              deactivated_reason: z.string(),
              reactivated_reason: z.string().nullable(),
              deactivated_at: z.date(),
              reactivated_at: z.date().nullable(),
              deactivated_by: z.string(),
              reactivated_by: z.string().nullable(),
              user_id: z.string(),
            })
          ),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
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
