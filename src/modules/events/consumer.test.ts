import { EventConsumer } from "./consumer.js";

const consumer = new EventConsumer();

await consumer.receiveMessages();

console.log("Consumer finished");