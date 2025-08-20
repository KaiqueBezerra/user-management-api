import type { FastifyPluginCallback } from "fastify";
import { getActivatedUsersRoute } from "./get-activated-users.ts";
import { getDeactivatedUsersRoute } from "./get-deactivated-users.ts";
import { deactivateUserRoute } from "./deactivate-user.ts";
import { getDeactivationsRoute } from "./get-deactivations.ts";
import { getDeactivatedUserRoute } from "./get-deactivated-user.ts";
import { deleteDeactivationUserRoute } from "./delete-deactivation.ts";
import { reactivateUserRoute } from "./reactivate-user.ts";

export const deactivatedUsersRoutes: FastifyPluginCallback = (
  app,
  _opts,
  done
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
