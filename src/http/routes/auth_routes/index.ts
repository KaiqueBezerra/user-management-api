import type { FastifyPluginCallback } from "fastify";
import { authLoginRoute } from "./login.ts";
import { verifyTokenRoute } from "./verify-token.ts";

export const authRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(authLoginRoute);
  app.register(verifyTokenRoute);

  done();
};
