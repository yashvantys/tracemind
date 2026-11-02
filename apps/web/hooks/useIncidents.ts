"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useIncidents() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(async (cursor?: string) => {
        try {
            const data = await api.fetchIncidents(cursor);
            if (cursor) {
                setIncidents(prev => [...prev, ...data.incidents]);
            } else {
                setIncidents(data.incidents);
            }
            setNextCursor(data.pagination?.nextCursor || null);
            setHasNextPage(data.pagination?.hasNextPage || false);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const deleteIncident = async (id: string) => {
        if (!confirm(`Delete ${id.slice(0, 8)}?`)) return;
        await api.deleteIncident(id);
        setIncidents(prev => prev.filter(i => i.id !== id));
    };

    const updateIncident = async (id: string, data: any) => {
        await api.updateIncident(id, data);
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    };

    return {
        incidents,
        setIncidents,
        nextCursor,
        hasNextPage,
        loading,
        error,
        loadPage,
        deleteIncident,
        updateIncident,
        refresh: () => loadPage(),
    };
}