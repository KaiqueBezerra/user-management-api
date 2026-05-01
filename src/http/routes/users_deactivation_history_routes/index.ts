import type { FastifyPluginCallback } from "fastify";
import { getUserDeactivationHistoryRoute } from "./get-user-deactivation-history.js";
import { getDeactivationsHistoryRoute } from "./get-users-deactivation-history.js";

export const usersDeactivationHistoryRoutes: FastifyPluginCallback = (
  app,
  _opts,
  done,
) => {
  app.register(getUserDeactivationHistoryRoute);
  app.register(getDeactivationsHistoryRoute);
  done();
};
