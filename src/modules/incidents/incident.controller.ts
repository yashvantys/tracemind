import type { FastifyReply, FastifyRequest } from "fastify";
import { createIncidentSchema } from "./incident.schema.js";
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
}