import type { FastifyPluginCallback } from "fastify";
import { authLoginRoute } from "./login.js";
import { verifyTokenRoute } from "./verify-token.js";

export const authRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(authLoginRoute);
  app.register(verifyTokenRoute);

  done();
};
