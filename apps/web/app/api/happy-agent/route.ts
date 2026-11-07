import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { messages, lead } = await req.json();

  // 1. Call OpenAI — same RAG pattern as TraceMind, but for qualification
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are HAPPPY Agent for Medica Stem Cells.
Your job: Qualify lead for stem cell treatment.
Ask in order: 1) condition 2) duration 3) city 4) tried treatment? 5) consent YES/NO 6) booking slot.
Rules: Ask only ONE question at a time. Be short, friendly, WhatsApp style. If user gives consent, say "Consent saved". If lead has severe pain + long duration + city in Gujarat, score = 0.91 Eligible.
Return JSON: { "reply": "your next message", "stage": "ask-condition|ask-duration|ask-city|ask-treatment|ask-consent|ask-booking|done", "score": 0.91, "isBooked": false }
`,
      },
      ...messages.map((m: any) => ({
        role: m.from === "ai" ? "assistant" : "user",
        content: m.text,
      })),
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");

  // 2. Save to Postgres — reuse your TraceMind pgvector DB, just a leads table
  // Uncomment when you add DB:
  // await sql`INSERT INTO leads (condition, city, score, consent) VALUES (${lead.condition}, ${lead.city}, ${result.score}, true)`

  return NextResponse.json(result);
}
