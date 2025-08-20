import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { schema } from "../../../db/schema/index.ts";
import { db } from "../../../db/connection.ts";

export const deleteUserRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/api/users/:userId",

    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user.",
        params: z.object({
          userId: z.uuid(),
        }),
        response: {
          200: z.object({
            message: z.string().default("User deleted successfully"),
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
        await db.delete(schema.users).where(eq(schema.users.id, userId));

        return reply.status(200).send({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Delete user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
