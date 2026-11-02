export function Header({ total, open, resolved }: { total: number; open: number; resolved: number }) {
    return (
        <>
            <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
                <div className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">T</div>
                        <div>
                            <h1 className="text- font-semibold">TraceMind</h1>
                            <p className="text- text-zinc-500">AI Debugger • Production Ready</p>
                        </div>
                    </div>
                    <span className="text- text-zinc-500 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        HNSW • threshold 0.75
                    </span>
                </div>
            </header>
            <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-950">
                <div className="border-r border-zinc-800 px-6 py-3"><p className="text- uppercase text-zinc-500">Total</p><p className="font-semibold">{total}</p></div>
                <div className="border-r border-zinc-800 px-6 py-3"><p className="text- uppercase text-zinc-500">Open</p><p className="font-semibold">{open}</p></div>
                <div className="px-6 py-3"><p className="text- uppercase text-zinc-500">Resolved</p><p className="font-semibold">{resolved}</p></div>
            </div>
        </>
    );
}