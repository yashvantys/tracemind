"use client";
import { useState, useMemo, useEffect } from "react";
import { useIncidents } from "../hooks/useIncidents";
import { Header } from "../components/Header";
import { IncidentList } from "../components/IncidentList";
import { IncidentDetail } from "../components/IncidentDetail";

export default function TraceMindDashboard() {
  const { incidents, setIncidents, nextCursor, hasNextPage, loading, loadPage, deleteIncident, updateIncident } = useIncidents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM">("ALL");

  // FIX: Auto-select first incident when loaded
  useEffect(() => {
    if (incidents.length > 0 && !selectedId) {
      setSelectedId(incidents[0].id);
    }
  }, [incidents, selectedId]);

  const selected = incidents.find(i => i.id === selectedId);

  const filtered = useMemo(() => incidents.filter(i => {
    const matchSearch = !search || i.errorMessage.toLowerCase().includes(search.toLowerCase()) || i.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || i.severity === filter;
    return matchSearch && matchFilter;
  }), [incidents, search, filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateIncident(id, { status });
  };

  const handleEdit = (inc: any) => {
    setSelectedId(inc.id);
  };

  const handleLoadMore = () => {
    loadPage(nextCursor || undefined);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500 text-sm">Loading incidents...</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black">
      <Header
        total={incidents.length}
        open={incidents.filter(i => i.status === "OPEN").length}
        resolved={incidents.filter(i => i.status === "RESOLVED").length}
      />

      <div className="flex h-[calc(100vh-98px)]">
        {/* Left Panel - List with Search + Filter */}
        <div className="w- shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950">
          <div className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-950">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <div className="flex gap-1.5">
              {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text- px-2.5 py-1 rounded-full border transition ${filter === f ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <IncidentList
            incidents={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={deleteIncident}
            onUpdateStatus={handleUpdateStatus}
            onEdit={handleEdit}
            onLoadMore={handleLoadMore}
            hasNextPage={hasNextPage}
            loadingMore={false}
          />
        </div>

        {/* Right Panel - Detail */}
        <div className="flex-1 overflow-auto bg-[#0f0f11]">
          <IncidentDetail
            incident={selected}
            onUpdateStatus={handleUpdateStatus}
            onDelete={deleteIncident}
            onUpdate={updateIncident}
            setIncidents={setIncidents}
          />
        </div>
      </div>
    </div>
  );
}