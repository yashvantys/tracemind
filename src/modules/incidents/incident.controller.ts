import type { FastifyReply, FastifyRequest } from "fastify";
import { createIncidentSchema, getIncidentsQuerySchema, updateIncidentSchema } from "./incident.schema.js";
import { IncidentService } from "./incident.service.js";

const incidentService = new IncidentService();
export class IncidentController {
    async createIncident(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        const data = createIncidentSchema.parse(request.body);
        const incident = await incidentService.createIncident(data);
        return reply.code(201).send({
            success: true,
            data: incident,
        });
    }

    async updateIncident(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply) {
        const data = updateIncidentSchema.parse(request.body);
        const id = request.params.id
        const incident = await incidentService.updateIncident(id, data)
        return reply.code(200).send({
            success: true,
            data: incident
        })
    }
    async deleteIncident(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply) {
        const id = request.params.id
        await incidentService.deleteIncident(id)
        return reply.code(204).send();
    }

    async getIncidentById(
        request: FastifyRequest<{
            Params: {
                id: string;
            };
        }>,
        reply: FastifyReply,
    ) {
        const incident = await incidentService.getIncidentById(
            request.params.id,
        );
        return reply.code(200).send({
            success: true,
            data: incident,
        });
    }

    async getAllIncidents(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        const query = getIncidentsQuerySchema.parse(request.query);
        const result = await incidentService.getAllIncidents(query);
        return reply.code(200).send({
            success: true,
            data: result,
        });
    }
}