"use client";
import { useState, useEffect, useMemo } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Incident {
  id: string;
  errorMessage: string;
  stackTrace?: string;
  serviceName: string;
  environment: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  createdAt: string;
}

interface SimilarIncident {
  id: string;
  errorMessage: string;
  serviceName: string;
  similarity: number;
}

interface Diagnosis {
  rootCause: string;
  evidence: string[];
  remediation: string[];
  confidence: number;
  similarIncidents?: SimilarIncident[];
}

export default function TraceMindFinalDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM">("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch with cursor pagination
  const fetchPage = async (cursor?: string) => {
    const url = cursor
      ? `${API_BASE}/api/v1/incidents?limit=10&cursor=${cursor}`
      : `${API_BASE}/api/v1/incidents?limit=10`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Your API returns { success, data: { incidents, pagination: { nextCursor, hasNextPage } } }
    const data = json.data || json;
    return {
      incidents: data.incidents || [],
      nextCursor: data.pagination?.nextCursor || data.nextCursor || null,
      hasNextPage: data.pagination?.hasNextPage || false,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page = await fetchPage();
        setIncidents(page.incidents);
        setNextCursor(page.nextCursor);
        setHasNextPage(page.hasNextPage);
        if (page.incidents.length > 0) setSelectedId(page.incidents[0].id);
      } catch (e: any) {
        setError(e.message || "Backend not reachable on 4000");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    if (!nextCursor) return;
    try {
      setLoadingMore(true);
      const page = await fetchPage(nextCursor);
      setIncidents(prev => [...prev, ...page.incidents]);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedId) return;
    try {
      setAnalyzing(true);
      const res = await fetch(`${API_BASE}/api/v1/incidents/${selectedId}/analyze`, { method: "POST" });
      if (!res.ok) throw new Error(`Analyze failed ${res.status}`);
      const json = await res.json();
      setDiagnosis(json.data || json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const selected = incidents.find(i => i.id === selectedId);

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch = !search || inc.errorMessage.toLowerCase().includes(search.toLowerCase()) || inc.serviceName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "ALL" || inc.severity === filter;
      return matchSearch && matchFilter;
    });
  }, [incidents, search, filter]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500 text-sm">Loading from {API_BASE} with cursor pagination...</div>;
  }

  if (error && incidents.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 max-w-md">
          <p className="text-red-400 font-semibold">Backend error on {API_BASE}</p>
          <p className="text-zinc-400 text-sm mt-2">{error}</p>
          <p className="text-zinc-500 text-xs mt-4">Ensure: docker-compose up + npm run dev in tracemind root</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">T</div>
            <div>
              <h1 className="text-[14px] font-semibold tracking-tight">TraceMind</h1>
              <p className="text-[11px] text-zinc-500 -mt-0.5">AI Incident Debugger • Cursor Pagination • Real API</p>
            </div>
            <div className="ml-4 hidden md:flex items-center gap-2 text-[11px]">
              <span className="px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">{incidents.length} loaded • {hasNextPage ? `${incidents.length}+ total` : `${incidents.length} total`} • cursor: {nextCursor ? "more" : "end"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>pgvector HNSW • threshold 0.75 • {API_BASE}</span>
          </div>
        </div>
      </header>

      {/* Top metrics - not a table */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-zinc-800 bg-zinc-950">
        {[
          { label: "Total Loaded", value: `${incidents.length}`, sub: hasNextPage ? "+ more via cursor" : "all loaded" },
          { label: "Pagination", value: "Cursor", sub: nextCursor ? "has next" : "end" },
          { label: "Vector Index", value: "HNSW", sub: "vector_cosine_ops" },
          { label: "RAG Safety", value: ">0.75", sub: "self-exclusion • Zod" },
        ].map(m => (
          <div key={m.label} className="border-r border-zinc-800 last:border-r-0 px-6 py-4 bg-zinc-950">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">{m.label}</p>
            <p className="mt-1 text-[15px] font-semibold">{m.value} <span className="text-[11px] font-normal text-zinc-500">{m.sub}</span></p>
          </div>
        ))}
      </div>

      <div className="flex h-[calc(100vh-98px)]">
        {/* Left - Incidents with search + filters + cursor pagination */}
        <div className="w-[400px] shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="p-3 border-b border-zinc-800 space-y-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search incidents, service..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <div className="flex gap-1.5">
              {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${filter === f ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filtered.length === 0 && <p className="p-6 text-sm text-zinc-500">No incidents match filter.</p>}
            {filtered.map(inc => (
              <button
                key={inc.id}
                onClick={() => { setSelectedId(inc.id); setDiagnosis(null); }}
                className={`group w-full text-left border-b border-zinc-800/80 px-4 py-3.5 hover:bg-zinc-900/80 transition ${selectedId === inc.id ? "bg-zinc-900 border-l-2 border-l-white !border-l-white" : "border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium leading-[18px] line-clamp-2 text-zinc-200 group-hover:text-white">{inc.errorMessage}</p>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${inc.severity === "CRITICAL" ? "bg-red-500/15 text-red-400 border border-red-500/20" : inc.severity === "HIGH" ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>{inc.severity}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">{inc.serviceName}</span>
                  <span>•</span>
                  <span suppressHydrationWarning>{mounted ? new Date(inc.createdAt).toLocaleDateString() : inc.createdAt.slice(0, 10)}</span>
                  <span>•</span>
                  <span className="truncate">{inc.id.slice(0, 8)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Cursor Pagination Controls */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-zinc-500">{incidents.length} loaded • cursor: {nextCursor ? nextCursor.slice(0, 8) + "..." : "none"}</p>
              <button
                onClick={loadMore}
                disabled={!hasNextPage || loadingMore}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : hasNextPage ? "Load more →" : "All loaded ✓"}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-zinc-600">Cursor pagination avoids OFFSET. Deterministic ordering without large DB offsets.</p>
          </div>
        </div>

        {/* Right - Detail */}
        <div className="flex-1 overflow-auto bg-[#0f0f11]">
          {selected ? (
            <div className="mx-auto max-w-3xl p-6 space-y-5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[13px] font-semibold tracking-tight">Incident • {selected.id}</h2>
                    <p className="text-[11px] text-zinc-500 mt-1">Real data from {API_BASE} • cursor pagination</p>
                  </div>
                  <button onClick={handleAnalyze} disabled={analyzing} className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-50 transition">
                    {analyzing ? "Analyzing..." : "▶ Analyze with RAG"}
                  </button>
                </div>
                <div className="mt-4 rounded-lg border border-zinc-800 bg-black/50 p-3 font-mono text-[13px] text-zinc-200">{selected.errorMessage}</div>
                {selected.stackTrace && <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-black/50 p-3 text-[11px] text-zinc-500">{selected.stackTrace.slice(0, 1000)}</pre>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{selected.serviceName}</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{selected.environment}</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">embedding: 1536 dim • truncated • validated • 429 retry</span>
                </div>
              </div>

              {diagnosis ? (
                <>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-semibold">AI Diagnosis • gpt-4o-mini • Zod Validated</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500">Confidence</span>
                        <div className="h-1.5 w-20 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-white transition-all" style={{ width: `${diagnosis.confidence * 100}%` }}></div></div>
                        <span className="text-xs font-mono font-bold">{diagnosis.confidence}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div><p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Root Cause</p><p className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[13px] leading-relaxed text-zinc-200">{diagnosis.rootCause}</p></div>
                      <div><p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Evidence</p><ul className="space-y-2">{diagnosis.evidence?.map((e,i) => <li key={i} className="text-[13px] text-zinc-400 flex gap-2"><span className="text-zinc-600">{i+1}.</span>{e}</li>)}</ul></div>
                      <div><p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Remediation</p><ul className="space-y-1.5">{diagnosis.remediation?.map((r,i) => <li key={i} className="text-[13px] text-zinc-300 flex gap-2"><span className="text-emerald-500">✓</span>{r}</li>)}</ul></div>
                    </div>
                  </div>

                  {diagnosis.similarIncidents && diagnosis.similarIncidents.length > 0 && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                      <h3 className="text-[12px] font-semibold">Similar • pgvector HNSW • 1-(embedding &lt;=&gt; query) • threshold 0.75 + excludeId</h3>
                      <div className="mt-3 space-y-2">
                        {diagnosis.similarIncidents.map(s => (
                          <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${s.similarity > 0.75 ? "bg-zinc-950 border-zinc-700" : "bg-zinc-950/50 border-zinc-800 opacity-60"}`}>
                            <div className="min-w-0"><p className="text-[13px] font-medium truncate">{s.errorMessage}</p><p className="text-[11px] text-zinc-500">{s.id} • {s.serviceName}</p></div>
                            <div className="ml-3 text-right shrink-0"><p className="font-mono text-[13px] font-bold">{s.similarity.toFixed(3)}</p><p className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full border ${s.similarity > 0.75 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>{s.similarity > 0.75 ? "INCLUDED" : "FILTERED"}</p></div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[11px] text-zinc-600">Filtered &lt;0.75 prevents RAG poisoning. Self excluded via excludeId. HNSW: CREATE INDEX USING hnsw (embedding vector_cosine_ops)</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
                  <p className="text-sm text-zinc-400">Click Analyze with RAG to generate diagnosis</p>
                  <p className="text-[11px] text-zinc-600 mt-2">Flow: truncate → embed 1536 dim ✓ → HNSW search with excludeId → filter &gt;0.75 → RAG &lt;current&gt;&lt;history&gt; sanitized → gpt-4o-mini + Zod validation</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-10 text-center">
              <div><p className="text-sm text-zinc-500">Select an incident from the left to debug</p><p className="text-[11px] text-zinc-600 mt-2">{incidents.length} incidents loaded via cursor pagination</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}