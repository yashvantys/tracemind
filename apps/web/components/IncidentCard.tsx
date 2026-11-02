"use client";

interface Props {
    incident: any;
    selected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, status: string) => void;
    onEdit: (incident: any) => void;
}

export function IncidentCard({ incident, selected, onSelect, onDelete, onUpdateStatus, onEdit }: Props) {
    const getStatusColor = (s: string) => {
        if (s === "OPEN") return "bg-red-500/15 text-red-400 border-red-500/20";
        if (s === "INVESTIGATING") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    };

    return (
        <div className={`border-b border-zinc-800/80 px-4 py-3 ${selected ? "bg-zinc-900" : "hover:bg-zinc-900/50"}`}>
            <button onClick={() => onSelect(incident.id)} className="w-full text-left">
                <div className="flex justify-between gap-2">
                    <p className="text- font-medium line-clamp-2">{incident.errorMessage}</p>
                    <span className={`text- px-1.5 py-0.5 rounded border h-fit shrink-0 ${incident.severity === "CRITICAL" ? "bg-red-500/15 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>{incident.severity}</span>
                </div>
                <div className="mt-2 flex gap-2">
                    <span className={`px-1.5 py-0.5 rounded border text- ${getStatusColor(incident.status)}`}>{incident.status}</span>
                    <span className="text- text-zinc-500">{incident.serviceName}</span>
                </div>
            </button>
            <div className="mt-2 flex gap-1.5">
                <select value={incident.status} onChange={e => onUpdateStatus(incident.id, e.target.value)} className="text- px-2 py-1 rounded bg-zinc-900 border border-zinc-800" onClick={e => e.stopPropagation()}>
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                </select>
                <button onClick={() => onEdit(incident)} className="text- px-2 py-1 rounded bg-zinc-800 border border-zinc-700">Edit</button>
                <button onClick={() => onDelete(incident.id)} className="text- px-2 py-1 rounded bg-red-950 border border-red-900 text-red-400">Delete</button>
            </div>
        </div>
    );
}