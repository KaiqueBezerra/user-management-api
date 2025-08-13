import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";
import { createUsersRoute } from "./http/routes/create-user.ts";
import { getUsersRoute } from "./http/routes/get-users.ts";
import { getUsersByIdRoute } from "./http/routes/get-user-by-id.ts";
import { updateUserRoute } from "./http/routes/update-user.ts";
import { getActivatedUsersRoute } from "./http/routes/get-activated-users.ts";
import { getDeactivationsRoute } from "./http/routes/get-deactivations.ts";
import { deactivateUserRoute } from "./http/routes/deactivate-user.ts";
import { getDeactivatedUsersRoute } from "./http/routes/get-deactivated-users.ts";
import { getDeactivatedUserRoute } from "./http/routes/get-deactivated-user.ts";
import { deleteUserRoute } from "./http/routes/delete-user.ts";
import { deleteDeactivatedUserRoute } from "./http/routes/delete-deactivated-user.ts";
import { reactivateUserRoute } from "./http/routes/reactivate-user.ts";
import { getUserDeactivationHistoryRoute } from "./http/routes/get-user-deactivation-history.ts";
import { getDeactivationsHistoryRoute } from "./http/routes/get-users-deactivation-history.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "http://localhost:5173",
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/api/health", () => {
  return "OK";
});

app.register(createUsersRoute);
app.register(getUsersRoute);
app.register(getUsersByIdRoute);
app.register(updateUserRoute);
app.register(deleteUserRoute);

app.register(getActivatedUsersRoute);
app.register(getDeactivatedUsersRoute);
app.register(deactivateUserRoute);
app.register(getDeactivationsRoute);
app.register(getDeactivatedUserRoute);
app.register(deleteDeactivatedUserRoute);
app.register(reactivateUserRoute);

app.register(getUserDeactivationHistoryRoute);
app.register(getDeactivationsHistoryRoute);

app.listen({ port: env.PORT });
