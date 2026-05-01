import { fastify } from "fastify";
import { env } from "./env.js";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { appRoutes } from "./http/routes/index.js";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: env.ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

await app.register(fastifyRateLimit, {
  global: false, // don't apply these settings to all the routes of the context
  max: 3000, // default global max rate limit
});

app.get("/api/health", async () => "OK");

app.register(appRoutes);

// Start the server
try {
  app.listen({ port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
