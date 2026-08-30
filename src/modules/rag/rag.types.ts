export interface RagIncident {
  id: string;
  serviceName: string;
  environment: string;
  errorMessage: string;
  stackTrace: string | null;
  logs: string | null;
  severity: string;
  status: string;
  createdAt: Date;
  similarity: number;
}

export interface RagAnalysis {
  rootCause: string;
  evidence: string[];
  remediation: string[];
  confidence: number;
}

export interface RagInput {
  serviceName: string;
  environment: string;
  errorMessage: string;
  stackTrace?: string | null;
  logs?: string | null;
}