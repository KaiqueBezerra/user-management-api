import type { FastifyPluginCallback } from "fastify";
import { authLoginRoute } from "./login.ts";

export const authRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(authLoginRoute);

  done();
};
