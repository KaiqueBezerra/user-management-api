import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { and, eq, isNull } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const reactivateUserRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/api/users/:userId/reactivate",

    {
      preHandler: [authMiddleware],
      schema: {
        body: z.object({
          reactivated_reason: z
            .string()
            .min(2, "Reason must be at least 2 characters"),
        }),
        params: z.object({
          userId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { reactivated_reason } = request.body;
      const { userId } = request.params;
      const { id: adminId } = request.user as { id: string };

      try {
        const admin = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, adminId))
          .limit(1);

        if (!admin[0] || admin[0].role !== "admin") {
          return reply.status(403).send({ message: "Unauthorized" });
        }

        if (userId === adminId) {
          return reply.status(400).send({ message: "Cannot reactivate self" });
        }

        // Verifica se o usuário está desativado (reactivated_at IS NULL)
        const existingDeactivation = await db
          .select()
          .from(schema.deactivated_users)
          .where(
            and(
              eq(schema.deactivated_users.user_id, userId),
              isNull(schema.deactivated_users.reactivated_at)
            )
          )
          .limit(1);

        if (existingDeactivation.length === 0) {
          return reply
            .status(400)
            .send({ message: "User is not currently deactivated" });
        }

        const result = await db
          .update(schema.deactivated_users)
          .set({
            reactivated_reason,
            reactivated_by: adminId,
            reactivated_at: new Date(),
          })
          .where(eq(schema.deactivated_users.user_id, userId))
          .returning();

        const updatedDeactivatedUsers = result[0];

        if (!updatedDeactivatedUsers) {
          return reply
            .status(404)
            .send({ message: "Deactivated user not found" });
        }

        return reply.status(200).send({
          id: updatedDeactivatedUsers.id,
          userId: updatedDeactivatedUsers.user_id,
          adminId: updatedDeactivatedUsers.reactivated_by,
        });
      } catch (error) {
        console.error("Reactivate user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
