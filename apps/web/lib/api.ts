import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    timeout: 15000,
});

export interface Incident {
    id: string;
    errorMessage: string;
    stackTrace?: string;
    serviceName: string;
    environment: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | string;
    createdAt: string;
}

export interface SimilarIncident {
    id: string;
    errorMessage: string;
    serviceName: string;
    similarity: number;
}

export interface Diagnosis {
    rootCause: string;
    evidence: string[];
    remediation: string[];
    confidence: number;
    similarIncidents?: SimilarIncident[];
}

export async function fetchIncidents(): Promise<Incident[]> {
    const { data } = await api.get('/incidents?limit=10');
    // Your API returns { success: true, data: { incidents, pagination } }
    return data.data?.incidents || data.incidents || [];
}

export async function analyzeIncident(id: string): Promise<Diagnosis> {
    const { data } = await api.post(`/incidents/${id}/analyze`);
    // Your API returns { success: true, data: { rootCause, evidence... } }
    return data.data || data;
}