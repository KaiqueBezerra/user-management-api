import fastify from "fastify";

const app = fastify();

app.get("/api/health", async () => "OK");

app.listen({ port: 3000 });
