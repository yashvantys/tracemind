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
export const updateIncidentSchema = z.object({
  serviceName: z.string().min(1).optional(),
  environment: z.string().min(1).optional(),
  errorMessage: z.string().min(1).optional(),
  stackTrace: z.string().optional(),
  logs: z.string().optional(),
  severity: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  status: z
    .enum(["OPEN", "INVESTIGATING", "RESOLVED"])
    .optional(),
})
export type UpdateIncidentRequest = z.infer<typeof updateIncidentSchema>
export const getIncidentsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
  cursor: z.string().optional(),
  severity: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  status: z
    .enum(["OPEN", "INVESTIGATING", "RESOLVED"])
    .optional(),
  serviceName: z
    .string()
    .min(1)
    .optional(),
  environment: z
    .string()
    .min(1)
    .optional(),
});