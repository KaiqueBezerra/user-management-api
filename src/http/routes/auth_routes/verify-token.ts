import jwt from "jsonwebtoken";
import { env } from "../../../env.ts";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

interface Decoded {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const verifyTokenRoute: FastifyPluginCallbackZod = (app) => {
    app.get(
        "/api/auth/validate",
        {
            schema: {
                tags: ["Auth"],
                summary: "Verify Token",
                description: "Verify a JWT token.",
                response: {
                    200: z.object({
                        valid: z.boolean(),
                        user: z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.string(),
                            role: z.string(),
                        }),
                    }),
                    401: z.object({
                        valid: z.boolean(),
                        message: z.string().default("Invalid token"),
                    }),
                    500: z.object({
                        message: z.string().default("Internal server error"),
                    }),
                },
            }
        },
        async (request, reply) => {
            const token = request.headers["authorization"]?.split(" ")[1];

            if (!token) {
                return reply.status(401).send({ valid: false, message: "No token provided" });
            }

            try {
                const decoded = jwt.verify(token, env.JWT_SECRET) as Decoded;
                return reply.status(200).send({ valid: true, user: decoded });
            } catch (error) {
                console.error("Login error:", error);
                return reply.status(401).send({ valid: false, message: "Invalid token" });
            }
        }
    );
};
