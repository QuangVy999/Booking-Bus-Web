import 'dotenv/config';
import { Kafka } from 'kafkajs';
import crypto from 'node:crypto';

const kafka = new Kafka({ clientId: 'booking-service', brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',') });
const producer = kafka.producer();
let connected = false;

export async function publishAnalyticsEvent(topic, type, payload) {
  try {
    if (!connected) { await producer.connect(); connected = true; }
    await producer.send({ topic, messages: [{ value: JSON.stringify({ id: crypto.randomUUID(), type, occurredAt: new Date().toISOString(), ...payload }) }] });
  } catch (error) {
    // Analytics must not roll back a completed booking/payment transaction.
    console.error(`Could not publish ${type} analytics event:`, error.message);
  }
}
