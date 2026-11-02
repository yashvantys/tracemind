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
        try {
            const embeddingInput = {
                serviceName: data.serviceName,
                environment: data.environment,
                errorMessage: data.errorMessage,
                stackTrace: data.stackTrace || null,
                logs: data.logs || null,
            };
            const embedding = await this.embeddingService.generateEmbedding(embeddingInput);
            await this.embeddingRepository.save(incident.id, embedding);
        } catch (err: any) {
            console.warn(`[Embedding] Failed: ${err.message}`);
        }
        try {
            const event: IncidentCreatedEvent = {
                eventId: randomUUID(),
                eventType: "INCIDENT_CREATED",
                occurredAt: new Date().toISOString(),
                incidentId: incident.id,
            };
            await this.eventPublisher.publishIncidentCreated(event);
        } catch (err: any) {
            console.warn(`[SQS] Failed but incident saved: ${err.message}`);
        }
        return incident;
    }

    async getIncidentById(id: string) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError("Incident not found", "INCIDENT_NOT_FOUND");
        }
        return incident;
    }

    async updateIncident(id: string, data: UpdateIncidentInput) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError("Incident not found", "INCIDENT_NOT_FOUND");
        }

        const updated = await this.incidentRepository.update(id, data);

        if (data.errorMessage || data.stackTrace || data.logs) {
            try {
                const embeddingInput = {
                    serviceName: updated.serviceName,
                    environment: updated.environment,
                    errorMessage: updated.errorMessage,
                    stackTrace: updated.stackTrace || null,
                    logs: updated.logs || null,
                };
                const newEmbedding = await this.embeddingService.generateEmbedding(embeddingInput);
                await this.embeddingRepository.save(id, newEmbedding);
            } catch (err: any) {
                console.warn(`[Embedding] Re-embed failed: ${err.message}`);
            }
        }

        return updated;
    }

    async deleteIncident(id: string) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new NotFoundError("Incident not found", "INCIDENT_NOT_FOUND");
        }

        // Delete embedding first if exists
        try {
            if (typeof (this.embeddingRepository as any).delete === 'function') {
                await (this.embeddingRepository as any).delete(id);
            }
        } catch { }

        return await this.incidentRepository.delete(id);
    }

    async getAllIncidents(filters: GetIncidentsFilters) {
        const result = await this.incidentRepository.findAll(filters);
        return {
            incidents: result.incidents,
            pagination: {
                limit: filters.limit,
                hasNextPage: result.hasNextPage,
                nextCursor: result.nextCursor ? encodeCursor(result.nextCursor) : null,
            },
        };
    }
}