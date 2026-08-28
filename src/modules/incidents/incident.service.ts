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
            throw new Error("Incident not found");
        }
        return incident;
    }
    async updateIncident(id: string, data: UpdateIncidentInput) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new Error("Incident not found");
        }
        return await this.incidentRepository.update(id, data)
    }
    async deleteIncident(id: string) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new Error("Incident not found");
        }
        return await this.incidentRepository.delete(id)
    }

    async getAllIncidents(page: number,
        limit: number,
        filters: Omit<GetIncidentsFilters, "skip" | "take">,) {
        const skip = (page - 1) * limit;

        const { incidents, total } =
            await this.incidentRepository.findAll({
                skip,
                take: limit,
                ...filters,
            });

        return {
            incidents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}