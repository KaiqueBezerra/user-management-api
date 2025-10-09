import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import z from "zod";
import { count, desc } from "drizzle-orm"; // <- importante

export const getUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Get users (paginated)",
        description: "Get a paginated list of users.",
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(50).default(10),
        }),
        response: {
          200: z.object({
            users: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                email: z.email(),
                role: z.string(),
                created_at: z.date(),
                updated_at: z.date().nullable(),
              })
            ),
            total: z.number(),
            page: z.number(),
            totalPages: z.number(),
          }),
          500: z.object({
            message: z.string().default("Internal server error"),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit } = request.query;
        const offset = (page - 1) * limit;

        // busca páginas + total em paralelo
        const [users, totalResult] = await Promise.all([
          db
            .select({
              id: schema.users.id,
              name: schema.users.name,
              email: schema.users.email,
              created_at: schema.users.created_at,
              updated_at: schema.users.updated_at,
              role: schema.users.role,
            })
            .from(schema.users)
            .orderBy(desc(schema.users.created_at))
            .limit(limit)
            .offset(offset),

          // count() vem do drizzle-orm
          db.select({ total: count() }).from(schema.users),
        ]);

        // totalResult[0].total pode ser bigint/string dependendo do driver — forçamos Number
        const total = Number(totalResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return reply.status(200).send({
          users,
          total,
          page,
          totalPages,
        });
      } catch (error) {
        console.error("Get users error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
