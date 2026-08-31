import {
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { env } from "../../config/env.js";
import type { IncidentCreatedEvent } from "./event.types.js";

const sqsClient = new SQSClient({
  region: env.AWS_REGION,
  endpoint: env.AWS_SQS_ENDPOINT,
});

export class EventPublisher {
  async publishIncidentCreated(
    event: IncidentCreatedEvent,
  ): Promise<void> {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: env.AWS_SQS_INCIDENT_QUEUE_URL,
        MessageBody: JSON.stringify(event),
      }),
    );
  }
}