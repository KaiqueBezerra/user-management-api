import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

export const deactivateUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/api/users/:userId/deactivate",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Deactivated Users"],
        summary: "Deactivate user",
        description: "Deactivate a user.",
        params: z.object({
          userId: z.uuid(),
        }),
        body: z.object({
          deactivated_reason: z
            .string()
            .min(2, "Reason must be at least 2 characters"),
        }),
        response: {
          200: z.object({ id: z.uuid(), userId: z.uuid(), adminId: z.uuid() }),
          201: z.object({ id: z.uuid(), userId: z.uuid(), adminId: z.uuid() }),
          400: z.object({ message: z.string().default("Bad request") }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },

    async (request, reply) => {
      const { userId } = request.params;
      const { deactivated_reason } = request.body;
      const { id: adminId } = request.user as { id: string };

      try {
        if (userId === adminId) {
          return reply.status(400).send({ message: "Cannot deactivate self" });
        }

        const existingDeactivation = await db
          .select()
          .from(schema.deactivated_users)
          .where(eq(schema.deactivated_users.user_id, userId))
          .limit(1);

        let result;

        if (existingDeactivation.length > 0) {
          // Update existing record
          result = await db
            .update(schema.deactivated_users)
            .set({
              deactivated_reason,
              deactivated_by: adminId,
              deactivated_at: new Date(),
              reactivated_at: null,
              reactivated_by: null,
              reactivated_reason: null,
            })
            .where(eq(schema.deactivated_users.id, existingDeactivation[0].id))
            .returning();
        } else {
          // Insert a new record
          result = await db
            .insert(schema.deactivated_users)
            .values({
              user_id: userId,
              deactivated_by: adminId,
              deactivated_reason,
            })
            .returning();
        }

        const userData = result[0];

        if (!userData) {
          return reply
            .status(400)
            .send({ message: "Failed to deactivate user" });
        }

        return reply.status(existingDeactivation.length > 0 ? 200 : 201).send({
          id: userData.id,
          userId: userData.user_id,
          adminId: userData.deactivated_by,
        });
      } catch (error) {
        console.error("Deactivate user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
