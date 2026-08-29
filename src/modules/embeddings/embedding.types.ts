export interface EmbeddingInput {
  serviceName: string;
  environment: string;
  errorMessage: string;
  stackTrace?: string | null;
  logs?: string | null;
}