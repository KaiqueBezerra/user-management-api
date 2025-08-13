import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const getUsersRoute: FastifyPluginCallbackZod = (app) => {
  app.get("/api/users", async (request, reply) => {
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
  });
};
