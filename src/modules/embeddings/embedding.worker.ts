import { IncidentRepository } from "../incidents/incident.repository.js";
import { EmbeddingRepository } from "./embedding.repository.js";
import { EmbeddingService } from "./embedding.service.js";
import type { IncidentCreatedEvent } from "../events/event.types.js";

export class EmbeddingWorker {
  private readonly incidentRepository: IncidentRepository;
  private readonly embeddingService: EmbeddingService;
  private readonly embeddingRepository: EmbeddingRepository;

  constructor() {
    this.incidentRepository = new IncidentRepository();
    this.embeddingService = new EmbeddingService();
    this.embeddingRepository = new EmbeddingRepository();
  }

  async process(
    event: IncidentCreatedEvent,
  ): Promise<void> {
    const incident =
      await this.incidentRepository.findById(
        event.incidentId,
      );

    if (!incident) {
      throw new Error(
        `Incident not found: ${event.incidentId}`,
      );
    }

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

    console.log(
      `Embedding generated for incident: ${incident.id}`,
    );
  }
}