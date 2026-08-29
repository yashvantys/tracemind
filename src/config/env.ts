import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  OPENAI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  RAG_MAX_RESULTS: z.coerce.number().int().positive().max(100).default(5),
  RAG_SIMILARITY_THRESHOLD: z.coerce
    .number()
    .min(0)
    .max(1)
    .default(0.7),
});

export const env = envSchema.parse(process.env);