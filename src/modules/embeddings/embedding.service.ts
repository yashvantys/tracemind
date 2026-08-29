import OpenAI from "openai";
import type { EmbeddingInput } from "./embedding.types.js";
import { env } from "../../config/env.js";
import { EmbeddingRepository } from "./embedding.repository.js";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export class EmbeddingService {
    private readonly embeddingRepository: EmbeddingRepository;
    constructor() {
        this.embeddingRepository = new EmbeddingRepository();
    }
    async generateEmbedding(input: EmbeddingInput): Promise<number[]> {
        const text = this.buildEmbeddingText(input);
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        return response?.data[0]?.embedding ?? [];
    }

    private buildEmbeddingText(input: EmbeddingInput): string {
        return [
            `Service: ${input.serviceName}`,
            `Environment: ${input.environment}`,
            `Error: ${input.errorMessage}`,
            `Stack Trace: ${input.stackTrace ?? ""}`,
            `Logs: ${input.logs ?? ""}`,
        ].join("\n");
    }

    async findSimilarIncidents(
        input: EmbeddingInput,
        limit = 5,
    ) {
        const embedding = await this.generateEmbedding(input);
        return this.embeddingRepository.findSimilar(
            embedding,
            limit,
        );
    }
}