import { IncidentRepository } from "./incident.repository.js";
import type { CreateIncidentInput } from "./incident.types.js";

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
}