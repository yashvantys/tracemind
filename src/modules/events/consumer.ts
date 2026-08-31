import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";

import { env } from "../../config/env.js";
import type { IncidentCreatedEvent } from "./event.types.js";
import { EmbeddingWorker } from "../embeddings/embedding.worker.js";
import { EventRepository } from "./event.repository.js";

const sqsClient = new SQSClient({
    region: env.AWS_REGION,
    endpoint: env.AWS_SQS_ENDPOINT,
});

export class EventConsumer {
    private readonly embeddingWorker: EmbeddingWorker;
    private readonly eventRepository: EventRepository;
    constructor() {
        this.embeddingWorker = new EmbeddingWorker();
        this.eventRepository = new EventRepository();
    }
    async receiveMessages(): Promise<void> {
        const response = await sqsClient.send(
            new ReceiveMessageCommand({
                QueueUrl: env.AWS_SQS_INCIDENT_QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 10,
            }),
        );

        const messages = response.Messages ?? [];
        for (const message of messages) {
            if (!message.Body || !message.ReceiptHandle) {
                continue;
            }

            const event = JSON.parse(message.Body) as IncidentCreatedEvent;
            // Check idempotency
            const alreadyProcessed =
                await this.eventRepository.exists(event.eventId);

            if (alreadyProcessed) {
                console.log(
                    `Event already processed: ${event.eventId}`,
                );

                // Delete duplicate message
                await sqsClient.send(
                    new DeleteMessageCommand({
                        QueueUrl: env.AWS_SQS_INCIDENT_QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle,
                    }),
                );

                continue;
            }
            console.log("Received event:", event);
            await this.processEvent(event);
            await this.eventRepository.markProcessed(
                event.eventId,
                event.eventType,
            );

            await sqsClient.send(
                new DeleteMessageCommand({
                    QueueUrl: env.AWS_SQS_INCIDENT_QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle,
                }),
            );

            console.log(
                `Message deleted: ${event.eventId}`,
            );
        }
    }

    private async processEvent(
        event: IncidentCreatedEvent,
    ): Promise<void> {
        switch (event.eventType) {
            case "INCIDENT_CREATED":
                await this.embeddingWorker.process(event);
                break;

            default:
                throw new Error(
                    `Unsupported event type: ${event.eventType}`,
                );
        }
    }
}