import { NotFoundError } from "../../utils/error.js";
import { encodeCursor } from "./incident.cursor.js";
import { IncidentRepository } from "./incident.repository.js";
import type { CreateIncidentInput, GetIncidentsFilters, UpdateIncidentInput } from "./incident.types.js";
import { EmbeddingService } from "../embeddings/embedding.service.js";
import { EmbeddingRepository } from "../embeddings/embedding.repository.js";
import { EventPublisher } from "../events/publisher.js";
import { randomUUID } from "node:crypto";
import type { IncidentCreatedEvent } from "../events/event.types.js";

export class IncidentService {
    private readonly incidentRepository: IncidentRepository;
    private readonly embeddingService: EmbeddingService;
    private readonly embeddingRepository: EmbeddingRepository;
    private readonly eventPublisher: EventPublisher;
    constructor() {
        this.incidentRepository = new IncidentRepository();
        this.embeddingService = new EmbeddingService();
        this.embeddingRepository = new EmbeddingRepository();
        this.eventPublisher = new EventPublisher();
    }

    async createIncident(data: CreateIncidentInput) {
        const incident = await this.incidentRepository.create(data);
        const event: IncidentCreatedEvent = {
            eventId: randomUUID(),
            eventType: "INCIDENT_CREATED",
            occurredAt: new Date().toISOString(),
            incidentId: incident.id,
        };
        await this.eventPublisher.publishIncidentCreated(event);
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