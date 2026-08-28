import { prisma } from "../../config/database.js";
import type { CreateIncidentInput } from "./incident.types.js";

export class IncidentRepository {
  async create(data: CreateIncidentInput) {
    return prisma.incident.create({
      data: {
        serviceName: data.serviceName,
        environment: data.environment,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        logs: data.logs,
      },
    });
  }

  async findById(id: string) {
    return prisma.incident.findUnique({
      where: {
        id,
      },
    });
  }
}