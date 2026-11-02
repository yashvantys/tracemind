import Fastify from "fastify";
import cors from "@fastify/cors";
import { incidentRoutes } from "./modules/incidents/incident.routes.js";
import { registerErrorHandler } from "./middleware/error.middleware.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  registerErrorHandler(app);
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "tracemind",
    };
  });

  app.register(incidentRoutes, {
    prefix: "/api/v1/incidents",
  });

  return app;
}