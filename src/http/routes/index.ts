import type { FastifyPluginCallback } from "fastify";
import { authRoutes } from "./auth_routes/index.ts";
import { usersRoutes } from "./users_routes/index.ts";
import { usersDeactivationHistoryRoutes } from "./users_deactivation_history_routes/index.ts";
import { deactivatedUsersRoutes } from "./deactivated_users_routes/index.ts";

export const appRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(authRoutes);
  app.register(usersRoutes);
  app.register(deactivatedUsersRoutes);
  app.register(usersDeactivationHistoryRoutes);

  done();
};
