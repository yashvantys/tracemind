import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";

export class EmbeddingRepository {
    async save(
        incidentId: string,
        embedding: number[],
    ): Promise<void> {
        const vector = `[${embedding.join(",")}]`;

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
    ) {
        const vector = `[${embedding.join(",")}]`;

        return prisma.$queryRaw`
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
}