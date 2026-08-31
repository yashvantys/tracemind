import { logger } from "../../shared/logger.js";
import { EventConsumer } from "./consumer.js";

const consumer = new EventConsumer();

let shuttingDown = false;

const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down worker...`);
    shuttingDown = true;
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

logger.info("TraceMind event worker started");

while (!shuttingDown) {
    try {
        await consumer.receiveMessages();
    } catch (error) {
        logger.error("Worker error", {
            error: error instanceof Error
                ? error.message
                : String(error),
        });

        if (!shuttingDown) {
            await new Promise((resolve) =>
                setTimeout(resolve, 5000),
            );
        }
    }
}

console.log("TraceMind event worker stopped");