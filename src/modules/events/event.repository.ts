import { prisma } from "../../config/database.js";

export class EventRepository {
  async exists(eventId: string): Promise<boolean> {
    const event = await prisma.processedEvent.findUnique({
      where: { eventId },
      select: { id: true },
    });

    return Boolean(event);
  }

  async markProcessed(
    eventId: string,
    eventType: string,
  ): Promise<void> {
    await prisma.processedEvent.create({
      data: {
        eventId,
        eventType,
      },
    });
  }
}