import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { alias } from "drizzle-orm/pg-core";

const userToDeactivate = alias(schema.users, "userToDeactivate");
const deactivatedBy = alias(schema.users, "deactivatedBy");

export const getDeactivatedUserRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users/:userId/deactivated",
    {
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
            deactivatedUserId: schema.deactivated_users.user_id,
            deactivatedUserName: userToDeactivate.name,
            deactivatedUserEmail: userToDeactivate.email,
            deactivated_reason: schema.deactivated_users.deactivated_reason,
            deactivatedAt: schema.deactivated_users.deactivated_at,
            deactivatedById: schema.deactivated_users.deactivated_by,
            deactivatedByName: deactivatedBy.name,
            deactivatedByEmail: deactivatedBy.email,
          })
          .from(schema.deactivated_users)
          .leftJoin(
            userToDeactivate,
            eq(schema.deactivated_users.user_id, userToDeactivate.id)
          )
          .leftJoin(
            deactivatedBy,
            eq(schema.deactivated_users.deactivated_by, deactivatedBy.id)
          )
          .where(
            and(
              eq(schema.deactivated_users.user_id, userId),
              isNull(schema.deactivated_users.reactivated_at)
            )
          );

        if (result.length === 0) {
          return reply.status(404).send({
            message: "User not found",
          });
        }

        return reply.status(200).send(result[0]);
      } catch (error) {
        console.error("Get deactivated user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
