import type { FastifyPluginCallback } from "fastify";
import { getActivatedUsersRoute } from "./get-activated-users.js";
import { getDeactivatedUsersRoute } from "./get-deactivated-users.js";
import { deactivateUserRoute } from "./deactivate-user.js";
import { getDeactivationsRoute } from "./get-deactivations.js";
import { getDeactivatedUserRoute } from "./get-deactivated-user.js";
import { deleteDeactivationUserRoute } from "./delete-deactivation.js";
import { reactivateUserRoute } from "./reactivate-user.js";

export const deactivatedUsersRoutes: FastifyPluginCallback = (
  app,
  _opts,
  done,
) => {
  app.register(getActivatedUsersRoute);
  app.register(getDeactivatedUsersRoute);
  app.register(deactivateUserRoute);
  app.register(getDeactivationsRoute);
  app.register(getDeactivatedUserRoute);
  app.register(deleteDeactivationUserRoute);
  app.register(reactivateUserRoute);

  done();
};
