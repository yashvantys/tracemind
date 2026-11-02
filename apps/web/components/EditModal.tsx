"use client";
import { useState, useEffect } from "react";

export function EditModal({ incident, onSave, onClose }: { incident: any; onSave: (data: any) => void; onClose: () => void }) {
    const [form, setForm] = useState({ errorMessage: "", severity: "MEDIUM", status: "OPEN" });

    useEffect(() => {
        if (incident) setForm({ errorMessage: incident.errorMessage, severity: incident.severity, status: incident.status });
    }, [incident]);

    if (!incident) return null;

    return (
        <div className="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-5">
            <h3 className="text- font-semibold text-yellow-200">Edit {incident.id.slice(0, 8)}</h3>
            <div className="mt-3 space-y-3">
                <textarea value={form.errorMessage} onChange={e => setForm({ ...form, errorMessage: e.target.value })} className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm" rows={3} />
                <div className="grid grid-cols-2 gap-3">
                    <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm">
                        <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
                    </select>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm">
                        <option>OPEN</option><option>INVESTIGATING</option><option>RESOLVED</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-white text-black text-sm">Save (re-embeds)</button>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
}