import Fastify from "fastify";
import cors from "@fastify/cors";
import { incidentRoutes } from "./modules/incidents/incident.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true,
  });

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