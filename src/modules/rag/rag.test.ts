import { RagService } from "./rag.service.js";

const ragService = new RagService();

const result = await ragService.analyzeIncident({
  serviceName: "payment-service",
  environment: "production",
  errorMessage: "Application cannot obtain a database connection",
  stackTrace: "Error: Connection acquisition timed out",
  logs: "Database pool has reached its maximum capacity",
});

console.dir(result, { depth: null });