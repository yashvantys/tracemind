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

        if (!text.trim()) {
            throw new Error("Cannot generate embedding for empty text");
        }

        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
            });

            const embedding = response.data[0]?.embedding;

            if (!embedding || embedding.length !== 1536) {
                throw new Error(`Invalid embedding: expected 1536 dims, got ${embedding?.length}`);
            }

            if (embedding.some(n => !isFinite(n))) {
                throw new Error("Embedding contains NaN/Infinity");
            }

            return embedding;
        } catch (err: any) {
            // Retry on rate limit
            if (err?.status === 429) {
                console.warn("OpenAI rate limited, retrying in 1s...");
                await new Promise(r => setTimeout(r, 1000));
                return this.generateEmbedding(input);
            }
            throw err;
        }
    }

    private buildEmbeddingText(input: EmbeddingInput): string {
        const cut = (s: string, n: number) => s ? s.slice(0, n) : "";
        return [
            `Service: ${input.serviceName}`,
            `Env: ${input.environment ?? "unknown"}`,
            `Error: ${cut(input.errorMessage, 500)}`,
            `Stack: ${cut(input.stackTrace ?? "", 1000)}`,
            `Logs: ${cut(input.logs ?? "", 1000)}`,
        ].join("\n");
    }

    async findSimilarIncidents(
        input: EmbeddingInput,
        limit = 5,
        excludeId?: string,
    ) {
        const embedding = await this.generateEmbedding(input);
        return this.embeddingRepository.findSimilar(
            embedding,
            limit,
            env.RAG_SIMILARITY_THRESHOLD,
            excludeId,
        );
    }
}