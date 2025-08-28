import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";
import { appRoutes } from "./http/routes/index.ts";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyRateLimit from "@fastify/rate-limit";
import z from "zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Swagger (OpenAPI)
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

app.register(fastifyCors, {
  origin: "http://localhost:5173",
});

await app.register(fastifyRateLimit, {
  global: false, // don't apply these settings to all the routes of the context
  max: 3000, // default global max rate limit
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get(
  "/api/health",
  {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
      },
    },
    schema: {
      tags: ["Health"],
      summary: "Health check",
      description: "Check if the API is running.",
      response: {
        200: z.string().default("OK"),
      },
    },
  },
  () => {
    return "OK";
  }
);

app.register(appRoutes);

app.listen({ port: env.PORT });
