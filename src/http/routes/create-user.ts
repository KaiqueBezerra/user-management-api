import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const createUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/api/users",
    {
      schema: {
        body: z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.email("Invalid email format"),
          role: z
            .string()
            .min(2, "Role must be at least 2 characters")
            .optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, role } = request.body;

      try {
        const result = await db
          .insert(schema.users)
          .values({ name, email, role })
          .returning();

        const insertedUser = result[0];

        if (!insertedUser) {
          return reply.status(400).send({ message: "Failed to create user" });
        }

        return reply.status(201).send({ userId: insertedUser.id });
      } catch (error) {
        console.error("Create user error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
