export interface CreateIncidentInput {
  serviceName: string;
  environment: string;
  errorMessage: string;
  stackTrace?: string;
  logs?: string;
}