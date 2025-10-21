import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import { eq, isNull } from "drizzle-orm";
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
        description: "Log in with email and password (admins only).",
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
          403: z.object({
            message: z.string().default("Access denied. Admins only."),
          }),
          423: z.object({
            message: z.string().default("Admin account is deactivated."),
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
        const result = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            password: schema.users.password,
            role: schema.users.role,
            deactivated_id: schema.deactivated_users.id,
            reactivated_at: schema.deactivated_users.reactivated_at,
          })
          .from(schema.users)
          .leftJoin(
            schema.deactivated_users,
            eq(schema.deactivated_users.user_id, schema.users.id)
          )
          .where(eq(schema.users.email, email))
          .limit(1);

        if (result.length === 0) {
          return reply.status(401).send({ message: "Invalid email or password" });
        }

        const user = result[0];

        if (user.role !== "admin") {
          return reply.status(403).send({ message: "Access denied. Admins only." });
        }

        const isDeactivated =
          user.deactivated_id !== null && user.reactivated_at === null;

        if (isDeactivated) {
          return reply.status(423).send({ message: "Admin account is deactivated." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return reply.status(401).send({ message: "Invalid password." });
        }

        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return reply.status(201).send({ token });
      } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
