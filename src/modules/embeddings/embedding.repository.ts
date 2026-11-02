import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import type { RagIncident } from "../rag/rag.types.js";

export class EmbeddingRepository {
  async save(incidentId: string, embedding: number[]): Promise<void> {
    if (!embedding || embedding.length !== 1536) {
      throw new Error(`Invalid embedding dimension: expected 1536, got ${embedding?.length}`);
    }
    if (embedding.some(n => !isFinite(n))) {
      throw new Error("Embedding contains NaN or Infinity");
    }

    const vector = `[${embedding.join(",")}]`;

    // FIXED: Removed ::uuid cast - id is text type
    await prisma.$executeRaw`
          UPDATE "Incident"
          SET "embedding" = ${vector}::vector
          WHERE "id" = ${incidentId}
        `;
  }

  async findSimilar(
    embedding: number[],
    limit = env.RAG_MAX_RESULTS,
    minSimilarity = env.RAG_SIMILARITY_THRESHOLD,
    excludeId?: string,
  ): Promise<RagIncident[]> {
    if (!embedding || embedding.length !== 1536) {
      throw new Error(`Invalid embedding dimension: ${embedding?.length}`);
    }

    const vector = `[${embedding.join(",")}]`;

    if (excludeId) {
      return prisma.$queryRaw<RagIncident[]>`
                SELECT
                  "id",
                  "serviceName",
                  "environment",
                  "errorMessage",
                  "stackTrace",
                  "logs",
                  "severity",
                  "status",
                  "createdAt",
                  1 - ("embedding" <=> ${vector}::vector) AS similarity
                FROM "Incident"
                WHERE "embedding" IS NOT NULL
                AND "id" != ${excludeId}
                AND 1 - ("embedding" <=> ${vector}::vector) >= ${minSimilarity}
                ORDER BY "embedding" <=> ${vector}::vector
                LIMIT ${limit}
            `;
    }

    return prisma.$queryRaw<RagIncident[]>`
          SELECT
            "id",
            "serviceName",
            "environment",
            "errorMessage",
            "stackTrace",
            "logs",
            "severity",
            "status",
            "createdAt",
            1 - ("embedding" <=> ${vector}::vector) AS similarity
          FROM "Incident"
          WHERE "embedding" IS NOT NULL
          AND 1 - ("embedding" <=> ${vector}::vector) >= ${minSimilarity}
          ORDER BY "embedding" <=> ${vector}::vector
          LIMIT ${limit}
        `;
  }

  async delete(incidentId: string): Promise<void> {
    await prisma.$executeRaw`
          UPDATE "Incident"
          SET "embedding" = NULL
          WHERE "id" = ${incidentId}
        `;
  }
}