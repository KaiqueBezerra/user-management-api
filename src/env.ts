import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  ORIGIN: z.string(),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  JWT_SECRET: z.string(),
  GEMINI_API_KEY: z.string().nullable(),
});

export const env = envSchema.parse(process.env);
