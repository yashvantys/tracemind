const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiResponse {
    incidents: any[];
    pagination?: { nextCursor: string | null; hasNextPage: boolean };
}

export const api = {
    base: API_BASE,

    async fetchIncidents(cursor?: string): Promise<ApiResponse> {
        const url = cursor
            ? `${API_BASE}/api/v1/incidents?limit=10&cursor=${cursor}`
            : `${API_BASE}/api/v1/incidents?limit=10`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json.data || json;
        return {
            incidents: data.incidents || [],
            pagination: data.pagination || { nextCursor: null, hasNextPage: false },
        };
    },

    async deleteIncident(id: string) {
        const res = await fetch(`${API_BASE}/api/v1/incidents/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Delete failed ${res.status}`);
        return res;
    },

    async updateIncident(id: string, data: any) {
        const res = await fetch(`${API_BASE}/api/v1/incidents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Update failed ${res.status}`);
        }
        return res.json();
    },

    async analyzeIncident(id: string) {
        const res = await fetch(`${API_BASE}/api/v1/incidents/${id}/analyze`, { method: 'POST' });
        if (!res.ok) throw new Error(`Analyze failed ${res.status}`);
        const json = await res.json();
        return json.data || json;
    },
};