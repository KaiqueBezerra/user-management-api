import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

export const getDeactivationsHistoryRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/deactivation-history",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Deactivated Users History"],
        summary: "Get users deactivation history",
        description: "Get a list of all users deactivation history.",
        response: {
          200: z.array(
            z.object({
              id: z.uuid(),
              user_id: z.uuid(),
              deactivation_reasons: z.array(z.string()),
              deactivation_dates: z.array(z.date()),
              reactivation_reasons: z.array(z.string()).nullable(),
              reactivation_dates: z.array(z.date()).nullable(),
              deactivations_by_admin: z.array(z.string()),
              reactivations_by_admin: z.array(z.string()).nullable(),
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
        const result = await db
          .select()
          .from(schema.users_deactivation_history);

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Get deactivated users error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
