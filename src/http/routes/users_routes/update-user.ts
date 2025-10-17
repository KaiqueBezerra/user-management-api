import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq, and, not } from "drizzle-orm";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

export const updateUserRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/api/users/:userId",

    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update a user.",
        body: z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.email(),
          role: z.enum(["admin", "user"]),
        }),
        params: z.object({
          userId: z.uuid(),
        }),
        response: {
          200: z.object({
            userId: z.uuid(),
          }),
          404: z.object({ message: z.string().default("User not found") }),
          409: z.object({ message: z.string().default("Email already exists") }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, role } = request.body;
      const { userId } = request.params;

      try {
        const existingUser = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(
            and(
              eq(schema.users.email, email),
              not(eq(schema.users.id, userId))
            )
          )
          .limit(1);

        if (existingUser.length > 0) {
          return reply.status(409).send({ message: "Email already exists" });
        }

        const result = await db
          .update(schema.users)
          .set({ name, email, role, updated_at: new Date() })
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
