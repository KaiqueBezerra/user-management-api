import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

export const createUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/api/users",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "10 minute",
        },
      },
      schema: {
        tags: ["Users"],
        summary: "Create user",
        description: "Create a new user.",
        body: z.object({
          name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .describe("User's full name"),
          email: z
            .email("Invalid email format")
            .describe("Valid email address"),
          password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .describe("Minimum 6 characters"),
          role: z
            .string()
            .min(2, "Role must be at least 2 characters")
            .optional()
            .describe("User role (e.g. admin, user)"),
        }),
        response: {
          201: z.object({
            userId: z.uuid(),
          }),
          400: z.object({
            message: z.string().default("Failed to create user"),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, role } = request.body;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db
          .insert(schema.users)
          .values({ name, email, password: hashedPassword, role })
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
