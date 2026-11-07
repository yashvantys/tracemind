"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { from: "ai" | "user"; text: string };
type Stage = "ask-condition" | "ask-duration" | "ask-city" | "ask-treatment" | "ask-consent" | "ask-booking" | "done";

export default function HappyAgentPage() {
    const [messages, setMessages] = useState<Msg[]>([
        { from: "ai", text: "Hi, I'm HAPPPY Agent for Medica. 👋 What pain / condition are you facing? e.g. knee pain, back pain, shoulder pain" },
    ]);
    const [input, setInput] = useState("");
    const [stage, setStage] = useState<Stage>("ask-condition");
    const [lead, setLead] = useState({ condition: "", duration: "", city: "", treatment: "" });
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!input.trim()) return;
        const userText = input.trim();
        const newMessages = [...messages, { from: "user" as const, text: userText }];
        setMessages(newMessages);
        setInput("");

        // Call backend instead of setTimeout
        const res = await fetch("/api/happy-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages, lead }),
        });
        const data = await res.json();

        setMessages((m) => [...m, { from: "ai", text: data.reply }]);
        setStage(data.stage);

        // If backend says booked, you can show slot here
        if (data.isBooked) {
            console.log("Booked, score:", data.score);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f7f9] p-4 flex justify-center">
            <div className="w-full max-w- bg-white rounded-2xl border shadow-sm flex flex-col h-">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">HAPPPY Agent — Medica Pilot</h1>
                        <p className="text-sm text-gray-500">Chat Agent • Synthetic Data Only • Consent-first</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">● Online</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${m.from === "ai" ? "bg-indigo-50 text-left" : "bg-gray-100 ml-auto text-right"
                                }`}
                        >
                            <b className="text-xs block opacity-60">{m.from === "ai" ? "HAPPPY Agent" : "You"}</b>
                            {m.text}
                        </div>
                    ))}
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
                    <button onClick={send} className="bg-black text-white px-5 py-2 rounded-full text-sm">
                        Send
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400 pb-3">
                    Demo: {lead.condition && `Condition: ${lead.condition} • `}{lead.city && `City: ${lead.city} • `}Stage: {stage}
                </p>
            </div>
        </div>
    );
}