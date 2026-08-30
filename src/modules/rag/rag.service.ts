import OpenAI from "openai";

import { env } from "../../config/env.js";
import { EmbeddingService } from "../embeddings/embedding.service.js";
import { buildRagPrompt } from "./rag.prompt.js";
import type {
  RagAnalysis,
  RagInput,
} from "./rag.types.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export class RagService {
  private readonly embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async analyzeIncident(
    incident: RagInput,
  ): Promise<RagAnalysis> {

    // 1. Find similar historical incidents
    const similarIncidents =
      await this.embeddingService.findSimilarIncidents(
        incident,
        env.RAG_MAX_RESULTS,
      );

    // 2. Build RAG prompt
    const prompt = buildRagPrompt(
      incident,
      similarIncidents,
    );

    // 3. Ask OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are TraceMind, a production incident analysis assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      response.choices[0]?.message.content;

    if (!content) {
      throw new Error(
        "AI returned an empty analysis",
      );
    }

    // 4. Parse AI response
    const analysis = JSON.parse(content) as Omit<
      RagAnalysis,
      "similarIncidents"
    >;

    // 5. Add database retrieval information
    return {
      ...analysis,
      similarIncidents: similarIncidents.map(
        (incident) => ({
          incidentId: incident.id,
          similarity: Number(incident.similarity),
          serviceName: incident.serviceName,
          errorMessage: incident.errorMessage,
        }),
      ),
    };
  }
}