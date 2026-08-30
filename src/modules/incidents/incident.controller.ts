import type { FastifyReply, FastifyRequest } from "fastify";
import { createIncidentSchema, getIncidentsQuerySchema, updateIncidentSchema } from "./incident.schema.js";
import { IncidentService } from "./incident.service.js";
import { RagService } from "../rag/rag.service.js";
import { BadRequestError, NotFoundError } from "../../utils/error.js";

const incidentService = new IncidentService();
const ragService = new RagService();
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

    async analyzeIncident(
        request: FastifyRequest<{
            Params: {
                id: string;
            };
        }>,
        reply: FastifyReply,
    ) {
        const { id } = request.params;

        if (!id) {
            throw new BadRequestError(
                "Please provide incident id",
                "INCIDENT_ID_REQUIRED",
            );
        }

        const incident =
            await incidentService.getIncidentById(id);

        if (!incident) {
            throw new NotFoundError(
                "Incident not found",
                "INCIDENT_NOT_FOUND",
            );
        }

        const result = await ragService.analyzeIncident({
            serviceName: incident.serviceName,
            environment: incident.environment,
            errorMessage: incident.errorMessage,
            stackTrace: incident.stackTrace,
            logs: incident.logs,
        });

        return reply.code(200).send({
            success: true,
            data: result,
        });
    }
}