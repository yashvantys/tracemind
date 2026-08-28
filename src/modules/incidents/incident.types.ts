export interface CreateIncidentInput {
  serviceName: string;
  environment: string;
  errorMessage: string;
  stackTrace?: string;
  logs?: string;
}

export interface UpdateIncidentInput {
  serviceName?: string;
  environment?: string;
  errorMessage?: string;
  stackTrace?: string;
  logs?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "OPEN" | "INVESTIGATING" | "RESOLVED";
}
export interface GetIncidentsFilters {
  skip: number;
  take: number;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "OPEN" | "INVESTIGATING" | "RESOLVED";
  serviceName?: string;
  environment?: string;
}