import type { FastifyPluginCallback } from "fastify";
import { createUsersRoute } from "./create-user.js";
import { getUsersRoute } from "./get-users.js";
import { getUsersByIdRoute } from "./get-user-by-id.js";
import { updateUserRoute } from "./update-user.js";
import { deleteUserRoute } from "./delete-user.js";
import { getUserByEmailGeminiRoute } from "./get-user-by-email-gemini.js";

export const usersRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(createUsersRoute);
  app.register(getUsersRoute);
  app.register(getUsersByIdRoute);
  app.register(updateUserRoute);
  app.register(deleteUserRoute);
  app.register(getUserByEmailGeminiRoute);

  done();
};
