import { z } from "zod";

export const createIncidentSchema = z.object({
  serviceName: z
    .string()
    .min(1, "Service name is required"),

  environment: z
    .string()
    .min(1, "Environment is required"),

  errorMessage: z
    .string()
    .min(1, "Error message is required"),

  stackTrace: z
    .string()
    .optional(),

  logs: z
    .string()
    .optional(),
});

export type CreateIncidentRequest = z.infer<
  typeof createIncidentSchema
>;