"use client";
import { useState } from "react";
import { EditModal } from "./EditModal";
import { api } from "../lib/api";

export function IncidentDetail({ incident, onUpdateStatus, onDelete, onUpdate, setIncidents }: any) {
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const data = await api.analyzeIncident(incident.id);
            setDiagnosis(data);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async (form: any) => {
        await api.updateIncident(incident.id, form);
        setIncidents((prev: any[]) => prev.map(i => i.id === incident.id ? { ...i, ...form } : i));
        setEditing(null);
    };

    if (!incident) return <div className="h-full flex items-center justify-center text-zinc-500 text-sm">Select an incident</div>;

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex justify-between gap-4">
                    <h2 className="text- font-semibold">Incident {incident.id.slice(0, 8)}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => onUpdateStatus(incident.id, "INVESTIGATING")} className="text-xs px-3 py-1.5 rounded-lg bg-yellow-900/50 border border-yellow-800 text-yellow-300">INVESTIGATING</button>
                        <button onClick={() => onUpdateStatus(incident.id, "RESOLVED")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-800 text-emerald-300">RESOLVED</button>
                        <button onClick={() => setEditing(incident)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Edit</button>
                        <button onClick={() => onDelete(incident.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-950 border border-red-900 text-red-400">Delete</button>
                        <button onClick={handleAnalyze} disabled={analyzing} className="text-xs px-3 py-1.5 rounded-lg bg-white text-black">{analyzing ? "Analyzing..." : "▶ Analyze RAG"}</button>
                    </div>
                </div>
                <div className="mt-4 rounded-lg border border-zinc-800 bg-black/50 p-3 font-mono text-">{incident.errorMessage}</div>
                <div className="mt-3 flex gap-1.5">
                    <span className="text- px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{incident.serviceName}</span>
                    <span className="text- px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{incident.status}</span>
                    <span className="text- px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{incident.severity}</span>
                </div>
            </div>

            {editing && <EditModal incident={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

            {diagnosis ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                    <h3 className="text- font-semibold">AI Diagnosis • Confidence {diagnosis.confidence}</h3>
                    <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-">{diagnosis.rootCause}</p>
                    {diagnosis.evidence && <ul className="mt-3 space-y-1">{diagnosis.evidence.map((e: string, i: number) => <li key={i} className="text- text-zinc-400">{i + 1}. {e}</li>)}</ul>}
                    {diagnosis.similarIncidents && (
                        <div className="mt-4">
                            <p className="text- uppercase text-zinc-500">Similar Incidents (threshold 0.75)</p>
                            {diagnosis.similarIncidents.map((s: any) => <div key={s.id} className="mt-2 flex justify-between border border-zinc-800 rounded-lg p-3"><p className="text-">{s.errorMessage}</p><span className="font-mono text-xs">{s.similarity?.toFixed(3)}</span></div>)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">Click Analyze RAG</div>
            )}
        </div>
    );
}