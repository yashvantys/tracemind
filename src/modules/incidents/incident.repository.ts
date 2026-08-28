import { prisma } from "../../config/database.js";
import { decodeCursor } from "./incident.cursor.js";
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
      limit,
      cursor,
      severity,
      status,
      serviceName,
      environment,
    } = filters;
    const decodedCursor = cursor
      ? decodeCursor(cursor)
      : undefined;

    const where = {
      ...(severity && { severity }),
      ...(status && { status }),
      ...(serviceName && { serviceName }),
      ...(environment && { environment }),
      ...(decodedCursor && {
        OR: [
          {
            createdAt: {
              lt: new Date(decodedCursor.createdAt),
            },
          },
          {
            createdAt: new Date(decodedCursor.createdAt),
            id: {
              lt: decodedCursor.id,
            },
          },
        ],
      }),
    };

    const incidents = await prisma.incident.findMany({
      where,
      take: limit + 1,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

    const hasNextPage = incidents.length > limit;

    if (hasNextPage) {
      incidents.pop();
    }

    const lastIncident = incidents.at(-1);
    const nextCursor =
      hasNextPage && lastIncident
        ? {
          createdAt: lastIncident.createdAt.toISOString(),
          id: lastIncident.id,
        }
        : null;

    return {
      incidents,
      hasNextPage,
      nextCursor,
    };
  }
}