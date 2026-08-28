import type { FastifyInstance } from "fastify";
import { IncidentController } from "./incident.controller.js";

const incidentController = new IncidentController();

export async function incidentRoutes(app: FastifyInstance) {
  app.post(
    "/",
    incidentController.createIncident.bind(incidentController),
  );

  app.get(
    "/:id",
    incidentController.getIncidentById.bind(incidentController),
  );
}