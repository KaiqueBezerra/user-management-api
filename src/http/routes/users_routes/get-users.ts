import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { authMiddleware } from "../../../middlewares/auth-middleware.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";
import z from "zod";
import { asc, count, desc, eq, isNull, and, or, sql } from "drizzle-orm";

export const getUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/api/users",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Get users (paginated)",
        description:
          "Get a paginated list of users. Supports role and deactivation filtering.",
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(50).default(10),
          sortBy: z.enum(["created_at", "updated_at"]).default("created_at"),
          order: z.enum(["asc", "desc"]).default("desc"),
          role: z.enum(["user", "admin", "all"]).default("all"),
          deactivated: z
            .enum(["true", "false"])
            .optional()
            .transform((val) => (val === undefined ? undefined : val === "true")),
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
                deactivated: z.boolean(),
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
        const { page, limit, sortBy, order, role, deactivated } = request.query;
        const offset = (page - 1) * limit;

        const sortColumn =
          sortBy === "updated_at" ? schema.users.updated_at : schema.users.created_at;
        const sortDirection = order === "asc" ? asc(sortColumn) : desc(sortColumn);

        // Base query (without where/order/limit yet)
        const baseSelect = db.select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          created_at: schema.users.created_at,
          updated_at: schema.users.updated_at,
          deactivated: sql<boolean>`
            CASE
              WHEN ${schema.deactivated_users.deactivated_at} IS NOT NULL
                AND ${schema.deactivated_users.reactivated_at} IS NULL
              THEN true
              ELSE false
            END
          `.as("deactivated"),
        })
          .from(schema.users)
          .leftJoin(
            schema.deactivated_users,
            eq(schema.deactivated_users.user_id, schema.users.id)
          );

        // Build Drizzle filters array (without applying yet)
        const filters: Array<any> = [];

        if (role !== "all") {
          filters.push(eq(schema.users.role, role));
        }

        if (deactivated === true) {
          filters.push(
            and(
              // deactivated_at IS NOT NULL AND reactivated_at IS NULL
              sql`${schema.deactivated_users.deactivated_at} IS NOT NULL`,
              isNull(schema.deactivated_users.reactivated_at)
            )
          );
        } else if (deactivated === false) {
          filters.push(
            or(
              // active when there is no deactivation record
              sql`${schema.deactivated_users.deactivated_at} IS NULL`,
              // or when there is reactivation
              sql`${schema.deactivated_users.reactivated_at} IS NOT NULL`
            )
          );
        }

        // Apply filters by creating a new builder (don't reassign baseSelect)
        const filteredQuery =
          filters.length > 0 ? baseSelect.where(and(...filters)) : baseSelect;

        // Apply sorting/pagination in another final builder
        const finalQuery = filteredQuery.orderBy(sortDirection).limit(limit).offset(offset);

        // Count total with the same filters
        const countBase = db
          .select({ total: count() })
          .from(schema.users)
          .leftJoin(
            schema.deactivated_users,
            eq(schema.deactivated_users.user_id, schema.users.id)
          );

        const countQuery = filters.length > 0 ? countBase.where(and(...filters)) : countBase;

        const [users, totalResult] = await Promise.all([finalQuery, countQuery]);

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
