import type { FastifyPluginCallback } from "fastify";
import { getUserDeactivationHistoryRoute } from "./get-user-deactivation-history.ts";
import { getDeactivationsHistoryRoute } from "./get-users-deactivation-history.ts";

export const usersDeactivationHistoryRoutes: FastifyPluginCallback = (
  app,
  _opts,
  done
) => {
  app.register(getUserDeactivationHistoryRoute);
  app.register(getDeactivationsHistoryRoute);
  done();
};
