"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { from: "ai" | "user"; text: string };
type Stage = "ask-condition" | "ask-duration" | "ask-city" | "ask-treatment" | "ask-consent" | "ask-booking" | "done";

const EXAMPLES = ["knee pain", "back pain for 6 months", "shoulder pain, 1 year"];
const SLOTS = ["08 Nov, 11:00 - Dr. A", "08 Nov, 14:00 - Dr. A", "09 Nov, 10:00 - Dr. A"];

const STEPS: { key: Stage; label: string }[] = [
    { key: "ask-condition", label: "Lead" },
    { key: "ask-duration", label: "Qualify" },
    { key: "ask-consent", label: "Consent" },
    { key: "ask-booking", label: "Book" },
    { key: "done", label: "Done" },
];

function getStepIndex(stage: Stage) {
    if (stage === "ask-condition") return 0;
    if (stage === "ask-duration" || stage === "ask-city" || stage === "ask-treatment") return 1;
    if (stage === "ask-consent") return 2;
    if (stage === "ask-booking") return 3;
    return 4;
}

export default function HappyAgentPage() {
    const [messages, setMessages] = useState<Msg[]>([
        { from: "ai", text: "Hi, I'm HAPPPY Agent for Medica. 👋 What pain / condition are you facing? e.g. knee pain, back pain, shoulder pain" },
    ]);
    const [input, setInput] = useState("");
    const [stage, setStage] = useState<Stage>("ask-condition");
    const [lead, setLead] = useState({ condition: "", duration: "", city: "", treatment: "" });
    const [selectedSlot, setSelectedSlot] = useState("");
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
        setSelectedSlot("");
        setInput("");
    };

    const sendText = async (text: string) => {
        if (!text.trim() || loading) return;
        const userText = text.trim();
        const newMessages = [...messages, { from: "user" as const, text: userText }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        // Save slot if booking
        if (stage === "ask-booking") {
            const idx = parseInt(userText) - 1;
            if (SLOTS[idx]) setSelectedSlot(SLOTS[idx]);
            if (SLOTS.includes(userText)) setSelectedSlot(userText);
        }

        try {
            const res = await fetch("/api/happy-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, lead }),
            });
            const data = await res.json();
            setMessages((m) => [...m, { from: "ai", text: data.reply }]);
            setStage(data.stage);

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
    const stepIdx = getStepIndex(stage);

    return (
        <div className="min-h-screen bg-[#f6f7f9] px-3 py-3 box-border">
            <div className="w-full max-w-[640px] mx-auto bg-white rounded-2xl border shadow-sm flex flex-col h-[88vh] overflow-hidden box-border">
                {/* Header */}
                <div className="p-4 border-b shrink-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold leading-tight">HAPPPY Agent — Medica Pilot</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Chat Agent • Synthetic Data Only • Consent-first</p>
                            <a href="https://github.com/yashvantys/tracemind" target="_blank" className="text-xs text-indigo-600 underline">
                                Built by Yashvant • TraceMind on GitHub →
                            </a>
                        </div>
                        <span className="shrink-0 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">● Online</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text- text-gray-500 mb-1">
                            {STEPS.map((s, i) => (
                                <span key={s.key} className={i <= stepIdx ? "text-indigo-700 font-semibold" : ""}>
                                    {s.label}
                                </span>
                            ))}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>
                        <p className="text- text-gray-400 mt-1">Step {stepIdx + 1} of {STEPS.length} • {STEPS[stepIdx].label}</p>
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
                        <button onClick={startOver} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full ml-auto">
                            ↺ Start Over
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overflow-x-hidden">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line break-words ${m.from === "ai" ? "bg-indigo-50 text-left" : "bg-gray-100 ml-auto text-right"
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

                    {/* Booking Slots - Buttons */}
                    {stage === "ask-booking" && !loading && (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">Tap a slot to book:</p>
                            {SLOTS.map((slot, idx) => (
                                <button
                                    key={slot}
                                    onClick={() => sendText(String(idx + 1))}
                                    className="block w-full text-left text-sm bg-white border border-indigo-200 hover:bg-indigo-50 px-3 py-2.5 rounded-xl"
                                >
                                    📅 {slot}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Booking Summary Card */}
                    {stage === "done" && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
                            <p className="font-bold text-green-800 text-base">✅ Booked Successfully</p>
                            <div className="mt-2 space-y-1 text-gray-700">
                                <p><b>Condition:</b> {lead.condition || "Knee pain"}</p>
                                <p><b>Duration:</b> {lead.duration || "-"}</p>
                                <p><b>City:</b> {lead.city || "Ahmedabad"}</p>
                                <p><b>Slot:</b> {selectedSlot || "08 Nov, 11:00 - Dr. A"}</p>
                                <p><b>Score:</b> 0.91 — Eligible</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Medica team will call to confirm. Reminder will be sent on WhatsApp.</p>
                            <button onClick={startOver} className="mt-3 text-xs bg-black text-white px-4 py-2 rounded-full">
                                Start New Enquiry →
                            </button>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t flex gap-2 shrink-0">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Type here... e.g. knee pain for 2 years"
                        className="flex-1 border rounded-full px-4 py-2 text-sm outline-none min-w-0"
                    />
                    <button onClick={send} disabled={loading} className="bg-black text-white px-5 py-2 rounded-full text-sm disabled:opacity-50 shrink-0">
                        {loading ? "..." : "Send"}
                    </button>
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 text-center shrink-0">
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