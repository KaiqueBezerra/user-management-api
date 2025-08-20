import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { alias } from "drizzle-orm/pg-core";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { schema } from "../../../db/schema/index.ts";
import { db } from "../../../db/connection.ts";

const userToDeactivate = alias(schema.users, "userToDeactivate");
const deactivatedBy = alias(schema.users, "deactivatedBy");

export const getDeactivatedUserRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users/:userId/deactivated",
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ["Deactivated Users"],
        summary: "Get deactivated user",
        description: "Get a deactivated user.",
        params: z.object({
          userId: z.uuid(),
        }),
        response: {
          200: z.object({
            deactivatedUserId: z.uuid(),
            deactivatedUserName: z.string(),
            deactivatedUserEmail: z.email(),
            deactivated_reason: z.string(),
            deactivatedAt: z.date(),
            deactivatedById: z.uuid(),
            deactivatedByName: z.string(),
            deactivatedByEmail: z.email(),
          }),
          404: z.object({
            message: z.string().default("Deactivated user not found"),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
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
          .innerJoin(
            userToDeactivate,
            eq(schema.deactivated_users.user_id, userToDeactivate.id)
          )
          .innerJoin(
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
            message: "Deactivated user not found",
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
