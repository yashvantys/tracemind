import { randomUUID } from "node:crypto";

import { EventPublisher } from "./publisher.js";
import type { IncidentCreatedEvent } from "./event.types.js";

const publisher = new EventPublisher();

const event: IncidentCreatedEvent = {
  eventId: randomUUID(),
  eventType: "INCIDENT_CREATED",
  occurredAt: new Date().toISOString(),
  incidentId: "a35aa532-bdd9-4147-820a-acf81f64f78f",
};

try {
  await publisher.publishIncidentCreated(event);

  console.log("Incident event published successfully:");
  console.dir(event, { depth: null });
} catch (error) {
  console.error("Failed to publish incident event:", error);
  process.exit(1);
}