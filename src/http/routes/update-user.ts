import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const updateUserRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/api/users/:userId",

    {
      preHandler: [authMiddleware],
      schema: {
        body: z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
        }),
        params: z.object({
          userId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { name } = request.body;
      const { userId } = request.params;

      try {
        const result = await db
          .update(schema.users)
          .set({ name, updated_at: new Date() })
          .where(eq(schema.users.id, userId))
          .returning();

        const updatedUser = result[0];

        if (!updatedUser) {
          return reply.status(404).send({ message: "User not found" });
        }

        return reply.status(200).send({ userId: updatedUser.id });
      } catch (error) {
        console.error("Update user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
