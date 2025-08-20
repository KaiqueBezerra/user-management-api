import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import z from "zod";

export const getUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Get users",
        description: "Get a list of all users.",
        response: {
          200: z.array(
            z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.email(),
              role: z.string(),
              created_at: z.date(),
              updated_at: z.date().nullable(),
            })
          ),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const result = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            created_at: schema.users.created_at,
            updated_at: schema.users.updated_at,
            role: schema.users.role,
          })
          .from(schema.users);

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Get users error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
