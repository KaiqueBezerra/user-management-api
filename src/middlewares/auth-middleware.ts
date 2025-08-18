import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.ts";
import jwt from "jsonwebtoken";

interface Decoded {
  id: string;
  role: string;
}

export function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function
) {
  const token = request.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return reply
      .status(401)
      .send({ message: "Unauthorized - No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as Decoded;

    if (decoded.role !== "admin") {
      return reply.status(403).send({ message: "Unauthorized - Not Admin" });
    }

    request.user = { id: decoded.id }; // Adds user.id to request
    done();
  } catch (error) {
    return reply.status(401).send({ message: "Unauthorized - Invalid Token" });
  }
}
