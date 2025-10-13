import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import z from "zod";
import { asc, count, desc, eq } from "drizzle-orm";

export const getUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Get users (paginated)",
        description: "Get a paginated list of users. Supports role filtering.",
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(50).default(10),
          sortBy: z.enum(["created_at", "updated_at"]).default("created_at"),
          order: z.enum(["asc", "desc"]).default("desc"),
          role: z.enum(["user", "admin", "all"]).default("all"),
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
        const { page, limit, sortBy, order, role } = request.query;
        const offset = (page - 1) * limit;

        const sortColumn =
          sortBy === "updated_at" ? schema.users.updated_at : schema.users.created_at;
        const sortDirection = order === "asc" ? asc(sortColumn) : desc(sortColumn);

        // Base query com filtro condicional
        const baseQuery = db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
            created_at: schema.users.created_at,
            updated_at: schema.users.updated_at,
          })
          .from(schema.users)
          .orderBy(sortDirection)
          .limit(limit)
          .offset(offset);

        // Se role ≠ "all", aplica filtro
        const usersQuery =
          role === "all" ? baseQuery : baseQuery.where(eq(schema.users.role, role));

        const [users, totalResult] = await Promise.all([
          usersQuery,
          role === "all"
            ? db.select({ total: count() }).from(schema.users)
            : db
              .select({ total: count() })
              .from(schema.users)
              .where(eq(schema.users.role, role)),
        ]);

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
