"use client";
import { IncidentCard } from "./IncidentCard";

export function IncidentList({ incidents, selectedId, onSelect, onDelete, onUpdateStatus, onEdit, onLoadMore, hasNextPage, loadingMore }: any) {
    return (
        <div className="w- shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
            <div className="flex-1 overflow-auto">
                {incidents.map((inc: any) => (
                    <IncidentCard key={inc.id} incident={inc} selected={selectedId === inc.id} onSelect={onSelect} onDelete={onDelete} onUpdateStatus={onUpdateStatus} onEdit={onEdit} />
                ))}
            </div>
            <div className="p-3 border-t border-zinc-800">
                <button onClick={onLoadMore} disabled={!hasNextPage || loadingMore} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-30">
                    {hasNextPage ? "Load more →" : "All loaded ✓"}
                </button>
            </div>
        </div>
    );
}