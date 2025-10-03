import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../../env.ts";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const authLoginRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/api/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
      schema: {
        tags: ["Auth"],
        summary: "Login",
        description: "Log in with email and password.",
        body: z.object({
          email: z.email("Invalid email format"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          401: z.object({
            message: z.string().default("Invalid email or password"),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));

        if (!user) {
          return reply.status(401).send({ message: "Invalid email." });
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user[0].password
        );

        if (!isPasswordValid) {
          return reply.status(401).send({ message: "Invalid password." });
        }

        const token = jwt.sign(
          { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role },
          env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        return reply.status(201).send({ token });
      } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
