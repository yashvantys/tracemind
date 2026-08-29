import { EmbeddingService } from "./embedding.service.js";

const embeddingService = new EmbeddingService();

const embedding = await embeddingService.generateEmbedding({
  serviceName: "payment-service",
  environment: "production",
  errorMessage: "Database connection timeout",
  stackTrace: "Error: connection timeout at connectDB",
  logs: "Connection pool exhausted",
});

const results =
  await embeddingService.findSimilarIncidents({
    serviceName: "payment-service",
    environment: "production",
    errorMessage: "PostgreSQL connection pool exhausted",
    stackTrace: "Error: database connection timeout",
    logs: "Database connections unavailable",
  });

console.log("Similar incidents:");
console.dir(results, { depth: null });

//console.log("Embedding dimensions:", embedding.length);
//console.log("First 5 values:", embedding.slice(0, 5));