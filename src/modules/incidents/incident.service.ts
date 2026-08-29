import { NotFoundError } from "../../utils/error.js";
import { encodeCursor } from "./incident.cursor.js";
import { IncidentRepository } from "./incident.repository.js";
import type { CreateIncidentInput, GetIncidentsFilters, UpdateIncidentInput } from "./incident.types.js";
import { EmbeddingService } from "../embeddings/embedding.service.js";
import { EmbeddingRepository } from "../embeddings/embedding.repository.js";

export class IncidentService {
    private readonly incidentRepository: IncidentRepository;
    private readonly embeddingService: EmbeddingService;
    private readonly embeddingRepository: EmbeddingRepository;
    constructor() {
        this.incidentRepository = new IncidentRepository();
        this.embeddingService = new EmbeddingService();
        this.embeddingRepository = new EmbeddingRepository();
    }

    async createIncident(data: CreateIncidentInput) {
        const incident = await this.incidentRepository.create(data);
        const embedding =
            await this.embeddingService.generateEmbedding({
                serviceName: incident.serviceName,
                environment: incident.environment,
                errorMessage: incident.errorMessage,
                stackTrace: incident.stackTrace,
                logs: incident.logs,
            });
        await this.embeddingRepository.save(
            incident.id,
            embedding,
        );
        return incident;
    }

    async getIncidentById(id: string) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError(
                "Incident not found",
                "INCIDENT_NOT_FOUND",
            );
        }
        return incident;
    }
    async updateIncident(id: string, data: UpdateIncidentInput) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError(
                "Incident not found",
                "INCIDENT_NOT_FOUND",
            );
        }
        return await this.incidentRepository.update(id, data)
    }
    async deleteIncident(id: string) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError(
                "Incident not found",
                "INCIDENT_NOT_FOUND",
            );
        }
        return await this.incidentRepository.delete(id)
    }

    async getAllIncidents(filters: GetIncidentsFilters) {
        const result = await this.incidentRepository.findAll(filters);
        return {
            incidents: result.incidents,
            pagination: {
                limit: filters.limit,
                hasNextPage: result.hasNextPage,
                nextCursor: result.nextCursor
                    ? encodeCursor(result.nextCursor)
                    : null,
            },
        };
    }
}