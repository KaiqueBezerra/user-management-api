import { fastify } from "fastify";
import { env } from "./env.js";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { appRoutes } from "./http/routes/index.ts";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: env.ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/api/health", async () => "OK");

app.register(appRoutes);

// Start the server
try {
  app.listen({ port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
