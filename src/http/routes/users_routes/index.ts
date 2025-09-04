import type { FastifyPluginCallback } from "fastify";
import { createUsersRoute } from "./create-user.ts";
import { getUsersRoute } from "./get-users.ts";
import { getUsersByIdRoute } from "./get-user-by-id.ts";
import { updateUserRoute } from "./update-user.ts";
import { deleteUserRoute } from "./delete-user.ts";
import { getUserByEmailGeminiRoute } from "./get-user-by-email-gemini.ts";

export const usersRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(createUsersRoute);
  app.register(getUsersRoute);
  app.register(getUsersByIdRoute);
  app.register(updateUserRoute);
  app.register(deleteUserRoute);
  app.register(getUserByEmailGeminiRoute);

  done();
};
