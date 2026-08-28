import { prisma } from "../../config/database.js";
import type { CreateIncidentInput, GetIncidentsFilters, UpdateIncidentInput } from "./incident.types.js";

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

  async update(id: string, data: UpdateIncidentInput) {
    return prisma.incident.update({
      where: { id },
      data,
    });
  }
  async delete(id: string) {
    return prisma.incident.delete({
      where: { id }
    })
  }
  async findAll(filters: GetIncidentsFilters) {
    const {
      skip,
      take,
      severity,
      status,
      serviceName,
      environment,
    } = filters;

    const where = {
      ...(severity && { severity }),
      ...(status && { status }),
      ...(serviceName && { serviceName }),
      ...(environment && { environment }),
    };

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.incident.count({
        where,
      }),
    ]);

    return {
      incidents,
      total,
    };
  }
}