import fastify from "fastify";
import { env } from "./env.ts";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Start the server
try {
  app.listen({ port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
