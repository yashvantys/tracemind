import { NotFoundError } from "../../utils/error.js";
import { encodeCursor } from "./incident.cursor.js";
import { IncidentRepository } from "./incident.repository.js";
import type { CreateIncidentInput, GetIncidentsFilters, UpdateIncidentInput } from "./incident.types.js";

export class IncidentService {
    private readonly incidentRepository: IncidentRepository;
    constructor() {
        this.incidentRepository = new IncidentRepository();
    }

    async createIncident(data: CreateIncidentInput) {
        const incident = await this.incidentRepository.create(data);
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