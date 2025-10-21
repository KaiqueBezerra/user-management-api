import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import { eq } from "drizzle-orm";

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
            .min(2, "Name must be at least 2 characters"),
          email: z
            .email("Invalid email format"),
          password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
          role: z
            .string()
            .min(2, "Role must be at least 2 characters")
            .optional()
        }),
        response: {
          201: z.object({
            userId: z.uuid(),
          }),
          400: z.object({
            message: z.string().default("Failed to create user"),
          }),
          409: z.object({
            message: z.string().default("Email already exists"),
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
        const existingUser = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          return reply.status(409).send({ message: "Email already exists" });
        }

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
