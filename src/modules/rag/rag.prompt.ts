import type { RagIncident, RagInput } from "./rag.types.js";

export function buildRagPrompt(
    incident: RagInput,
    similarIncidents: RagIncident[],
): string {
    const historicalContext = similarIncidents
        .map(
            (item, index) => `
                Historical Incident ${index + 1}
                Similarity: ${item.similarity.toFixed(3)}
                Service: ${item.serviceName}
                Environment: ${item.environment}
                Severity: ${item.severity}
                Status: ${item.status}
                Error: ${item.errorMessage}
                Stack Trace: ${item.stackTrace ?? "N/A"}
                Logs: ${item.logs ?? "N/A"}
                `,
            )
        .join("\n");

    return `
        You are TraceMind, an AI-powered production incident analysis assistant.

        Analyze the current production incident using the historical incidents retrieved
        from the TraceMind knowledge base.

        CURRENT INCIDENT
        Service: ${incident.serviceName}
        Environment: ${incident.environment}
        Error: ${incident.errorMessage}
        Stack Trace: ${incident.stackTrace ?? "N/A"}
        Logs: ${incident.logs ?? "N/A"}

        HISTORICAL INCIDENTS
        ${historicalContext || "No relevant historical incidents were found."}

        INSTRUCTIONS

        1. Identify the most likely root cause.
        2. Explain the evidence supporting the root cause.
        3. Recommend practical remediation steps.
        4. Use historical incidents as supporting evidence, not as absolute truth.
        5. Do not invent facts that are not present in the incident or historical context.
        6. If the evidence is insufficient, clearly state that.
        7. Confidence must be a number between 0 and 1.

        Return ONLY valid JSON using this structure:

        {
        "rootCause": "string",
        "evidence": [
            "string"
        ],
        "remediation": [
            "string"
        ],
        "confidence": 0.0
        }
        `;
}