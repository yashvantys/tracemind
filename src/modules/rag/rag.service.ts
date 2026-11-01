import OpenAI from "openai";
import { z } from "zod";
import { env } from "../../config/env.js";
import { EmbeddingService } from "../embeddings/embedding.service.js";
import { buildRagPrompt } from "./rag.prompt.js";
import type { RagAnalysis, RagInput } from "./rag.types.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const RagSchema = z.object({
  rootCause: z.string(),
  evidence: z.array(z.string()),
  remediation: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export class RagService {
  private readonly embeddingService = new EmbeddingService();

  async analyzeIncident(incident: RagInput): Promise<RagAnalysis> {
    const similarIncidents = await this.embeddingService.findSimilarIncidents(
      incident,
      env.RAG_MAX_RESULTS,
    );

    const filtered = similarIncidents.filter(s => Number(s.similarity) > 0.75);

    if (filtered.length === 0) {
      return {
        rootCause: "No relevant historical incidents",
        evidence: [],
        remediation: ["Check recent deploys", "Check logs"],
        confidence: 0.3,
        similarIncidents: []
      };
    }

    const prompt = buildRagPrompt(incident, filtered); // USE FILTERED

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are TraceMind. Analyze ONLY provided context. Return JSON with rootCause, evidence[], remediation[], confidence." },
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("AI returned empty analysis");

    // Zod validation - prevents crash
    const parsed = RagSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      throw new Error(`Invalid AI JSON: ${parsed.error.message}`);
    }

    // Cost tracking
    console.log(`Tokens: ${response.usage?.prompt_tokens} -> ${response.usage?.completion_tokens}`);

    return {
      ...parsed.data,
      similarIncidents: filtered.map(i => ({
        incidentId: i.id,
        similarity: Number(i.similarity),
        serviceName: i.serviceName,
        errorMessage: i.errorMessage,
      })),
    };
  }
}