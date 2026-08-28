interface IncidentCursor {
  createdAt: string;
  id: string;
}

export function encodeCursor(cursor: IncidentCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(cursor: string): IncidentCursor {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");

    const parsed: unknown = JSON.parse(decoded);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("createdAt" in parsed) ||
      !("id" in parsed) ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "string"
    ) {
      throw new Error("Invalid cursor");
    }

    return {
      createdAt: parsed.createdAt,
      id: parsed.id,
    };
  } catch {
    throw new Error("Invalid cursor");
  }
}