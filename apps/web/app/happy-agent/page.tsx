"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { from: "ai" | "user"; text: string };
type Stage = "ask-condition" | "ask-duration" | "ask-city" | "ask-treatment" | "ask-consent" | "ask-booking" | "done";

const EXAMPLES = ["knee pain", "back pain for 6 months", "shoulder pain, 1 year"];

export default function HappyAgentPage() {
    const [messages, setMessages] = useState<Msg[]>([
        { from: "ai", text: "Hi, I'm HAPPPY Agent for Medica. 👋 What pain / condition are you facing? e.g. knee pain, back pain, shoulder pain" },
    ]);
    const [input, setInput] = useState("");
    const [stage, setStage] = useState<Stage>("ask-condition");
    const [lead, setLead] = useState({ condition: "", duration: "", city: "", treatment: "" });
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startOver = () => {
        setMessages([
            { from: "ai", text: "Hi, I'm HAPPPY Agent for Medica. 👋 What pain / condition are you facing? e.g. knee pain, back pain, shoulder pain" },
        ]);
        setStage("ask-condition");
        setLead({ condition: "", duration: "", city: "", treatment: "" });
        setInput("");
    };

    const sendText = async (text: string) => {
        if (!text.trim() || loading) return;
        const userText = text.trim();
        const newMessages = [...messages, { from: "user" as const, text: userText }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/happy-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, lead }),
            });
            const data = await res.json();
            setMessages((m) => [...m, { from: "ai", text: data.reply }]);
            setStage(data.stage);
            // Update lead for display
            if (stage === "ask-condition") setLead((l) => ({ ...l, condition: userText }));
            if (stage === "ask-duration") setLead((l) => ({ ...l, duration: userText }));
            if (stage === "ask-city") setLead((l) => ({ ...l, city: userText }));
            if (stage === "ask-treatment") setLead((l) => ({ ...l, treatment: userText }));
        } catch {
            setMessages((m) => [...m, { from: "ai", text: "Sorry, connection issue. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const send = () => sendText(input);

    return (
        <div className="min-h-screen bg-[#f6f7f9] flex justify-center overflow-x-hidden">
            <div className="w-full max-w-[640px] mx-3 my-3 sm:mx-4 sm:my-4 bg-white rounded-2xl border shadow-sm flex flex-col h-[86vh] overflow-hidden">
                {/* Header - Fixed for mobile */}
                <div className="p-4 border-b">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold leading-tight">HAPPPY Agent — Medica Pilot</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Chat Agent • Synthetic Data Only • Consent-first</p>
                            <a
                                href="https://github.com/yashvantys/tracemind"
                                target="_blank"
                                className="text-xs text-indigo-600 underline"
                            >
                                Built by Yashvant • TraceMind on GitHub →
                            </a>
                        </div>
                        <span className="shrink-0 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">● Online</span>
                    </div>

                    {/* Try Example Chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs text-gray-500 self-center">Try:</span>
                        {EXAMPLES.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => sendText(ex)}
                                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full border border-indigo-100"
                            >
                                {ex}
                            </button>
                        ))}
                        <button
                            onClick={startOver}
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full ml-auto"
                        >
                            ↺ Start Over
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overflow-x-hidden">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${m.from === "ai" ? "bg-indigo-50 text-left" : "bg-gray-100 ml-auto text-right"
                                }`}
                        >
                            <b className="text-xs block opacity-60">{m.from === "ai" ? "HAPPPY Agent" : "You"}</b>
                            {m.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="max-w-[60%] px-3 py-2 rounded-2xl text-sm bg-indigo-50 text-gray-500 animate-pulse">
                            HAPPPY Agent is typing...
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Type here... e.g. knee pain for 2 years"
                        className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
                    />
                    <button
                        onClick={send}
                        disabled={loading}
                        className="bg-black text-white px-5 py-2 rounded-full text-sm disabled:opacity-50"
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>

                {/* Footer - GDPR + Status */}
                <div className="px-4 pb-3 text-center">
                    <p className="text- text-gray-400 leading-relaxed">
                        Demo uses synthetic data only. No real patient data stored. Consent required before booking. Human handover for consultation.
                    </p>
                    <p className="text- text-gray-400 mt-1">
                        {lead.condition && `Condition: ${lead.condition} • `}
                        {lead.city && `City: ${lead.city} • `}Stage: {stage}
                    </p>
                </div>
            </div>
        </div>
    );
}