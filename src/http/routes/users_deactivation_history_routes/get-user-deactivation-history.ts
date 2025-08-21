import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

const userDeactivationHistorySchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  deactivation_reasons: z.array(z.string()),
  deactivation_dates: z.array(z.date()),
  reactivation_reasons: z.array(z.string()).nullable(),
  reactivation_dates: z.array(z.date()).nullable(),
  deactivations_by_admin: z.array(z.string()),
  reactivations_by_admin: z.array(z.string()).nullable(),
});

export const getUserDeactivationHistoryRoute: FastifyPluginCallbackZod = (
  app
) => {
  app.get(
    "/api/users/:userId/deactivation-history",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Deactivated Users History"],
        summary: "Get user deactivation history",
        description: "Get a user deactivation history.",
        params: z.object({
          userId: z.uuid(),
        }),
        querystring: z.object({
          field: z.string().optional(),
        }),
        response: {
          200: z.union([
            userDeactivationHistorySchema,
            z.record(z.string(), z.any()), // allow objects with dynamic keys
          ]),
          400: z.object({
            message: z.string().default("Bad request"),
          }),
          404: z.object({
            message: z.string().default("User deactivation history not found"),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      const { field } = request.query;

      try {
        const result = await db
          .select()
          .from(schema.users_deactivation_history)
          .where(eq(schema.users_deactivation_history.user_id, userId));

        if (result.length === 0) {
          return reply
            .status(404)
            .send({ message: "User deactivation history not found" });
        }

        const data = result[0];

        if (field) {
          const requestedFields = field.split(",").map((f) => f.trim());

          // Checks if all fields exist in the object
          const invalidFields = requestedFields.filter((f) => !(f in data));

          if (invalidFields.length > 0) {
            return reply.status(400).send({
              message: `Fields not found: ${invalidFields.join(", ")}`,
            });
          }

          // build an object with only the requested fields
          const filteredData: Record<string, any> = {};
          for (const f of requestedFields) {
            filteredData[f] = data[f as keyof typeof data];
          }

          return reply.status(200).send(filteredData);
        }

        // If no field parameter is passed, return everything
        return reply.status(200).send(data);
      } catch (error) {
        console.error("Get user deactivation history error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
