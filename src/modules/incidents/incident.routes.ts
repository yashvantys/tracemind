import type { FastifyInstance } from "fastify";
import { IncidentController } from "./incident.controller.js";

const incidentController = new IncidentController();

export async function incidentRoutes(app: FastifyInstance) {
  app.post(
    "/",
    incidentController.createIncident.bind(incidentController),
  );

  app.put(
    "/:id",
    incidentController.updateIncident.bind(incidentController)
  )
  app.delete(
    "/:id",
    incidentController.deleteIncident.bind(incidentController)
  )

  app.get(
    "/:id",
    incidentController.getIncidentById.bind(incidentController),
  );

  app.get(
    "/",
    incidentController.getAllIncidents.bind(incidentController),
  );
  app.post(
    "/:id/analyze",
    incidentController.analyzeIncident.bind(incidentController),
  );
}