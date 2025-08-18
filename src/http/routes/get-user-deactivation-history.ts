import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "../../middlewares/auth-middleware.ts";

export const getUserDeactivationHistoryRoute: FastifyPluginCallbackZod = (
  app
) => {
  app.get(
    "/api/users/:userId/deactivation-history",
    {
      preHandler: [authMiddleware],
      schema: {
        params: z.object({
          userId: z.uuid(),
        }),
        querystring: z.object({
          field: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      const { field } = request.query;

      try {
        const result = await db
          .select()
          .from(schema.user_deactivation_history)
          .where(eq(schema.user_deactivation_history.user_id, userId));

        if (result.length === 0) {
          return reply
            .status(404)
            .send({ message: "User deactivation history not found" });
        }

        const data = result[0];

        if (field) {
          const requestedFields = field.split(",").map((f) => f.trim());

          // verifica se todos os campos existem no objeto
          const invalidFields = requestedFields.filter((f) => !(f in data));

          if (invalidFields.length > 0) {
            return reply.status(400).send({
              message: `Fields not found: ${invalidFields.join(", ")}`,
            });
          }

          // monta o objeto só com os campos solicitados
          const filteredData: Record<string, any> = {};
          for (const f of requestedFields) {
            filteredData[f] = data[f as keyof typeof data];
          }

          return reply.status(200).send(filteredData);
        }

        // se não passou parâmetro, retorna tudo
        return reply.status(200).send(data);
      } catch (error) {
        console.error("Get user deactivation history error:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
