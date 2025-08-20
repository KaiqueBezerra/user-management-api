import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { schema } from "../../../db/schema/index.ts";
import { db } from "../../../db/connection.ts";

export const deleteDeactivationUserRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/api/users/:deactivatedId/deactivated",

    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Deactivated Users"],
        summary: "Delete deactivated user",
        description: "Delete a deactivated user.",
        params: z.object({
          deactivatedId: z.uuid(),
        }),
        response: {
          200: z.object({
            message: z
              .string()
              .default("Deactivated user deleted successfully"),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
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
