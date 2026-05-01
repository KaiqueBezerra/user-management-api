import { fastify } from "fastify";
import { env } from "./env.js";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { appRoutes } from "./http/routes/index.js";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifySwagger from "@fastify/swagger";

const app = fastify().withTypeProvider<ZodTypeProvider>();

const isStaging = process.env.VERCEL_ENV === "preview";

// Swagger (OpenAPI)
if (isStaging) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "User Management API",
        description: "API de gerenciamento de usuários",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs", // acess docs at http://localhost:3333/docs
  });
}

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
