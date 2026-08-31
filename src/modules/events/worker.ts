import { EventConsumer } from "./consumer.js";
const consumer = new EventConsumer();

console.log("TraceMind event worker started");

while (true) {
  try {
    await consumer.receiveMessages();
  } catch (error) {
    console.error("Worker error:", error);

    await new Promise((resolve) =>
      setTimeout(resolve, 5000),
    );
  }
}