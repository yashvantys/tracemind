export type IncidentCreatedEvent = {
  eventId: string;
  eventType: "INCIDENT_CREATED";
  occurredAt: string;

  incidentId: string;
};