import 'dotenv/config';
import express from 'express';
import { Kafka } from 'kafkajs';
import pg from 'pg';
import crypto from 'node:crypto';

const { Pool } = pg;
const port = Number(process.env.PORT || 4010);
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://admin:123456@localhost:15434/analytics_db' });
const kafka = new Kafka({ clientId: 'analytics-service', brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',') });
const consumer = kafka.consumer({ groupId: 'analytics-consumers-v1' });
const producer = kafka.producer();
const admin = kafka.admin();
let producerConnected = false;
const analyticsTopics = ['search-events', 'booking-events', 'payment-events'];

async function prepareDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY, event_id UUID UNIQUE, topic TEXT NOT NULL,
      event_type TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS analytics_events_type_time ON analytics_events(event_type, occurred_at);
  `);
}

async function persistEvent(topic, rawValue) {
  const event = JSON.parse(rawValue.toString());
  await pool.query(
    `INSERT INTO analytics_events (event_id, topic, event_type, occurred_at, payload)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (event_id) DO NOTHING`,
    [event.id, topic, event.type, event.occurredAt, event],
  );
}

async function startConsumer() {
  await admin.connect();
  await admin.createTopics({ topics: analyticsTopics.map((topic) => ({ topic, numPartitions: 1, replicationFactor: 1 })), waitForLeaders: true });
  await admin.disconnect();
  await consumer.connect();
  await consumer.subscribe({ topics: analyticsTopics, fromBeginning: false });
  await consumer.run({ eachMessage: async ({ topic, message }) => persistEvent(topic, message.value) });
}

const app = express();
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'analytics-service' }));
app.use(express.json());
app.post('/events/search', async (req, res, next) => {
  try {
    const { origin, destination, date } = req.body || {};
    if (!origin || !destination) return res.status(400).json({ error: 'origin and destination are required' });
    if (!producerConnected) { await producer.connect(); producerConnected = true; }
    await producer.send({ topic: 'search-events', messages: [{ value: JSON.stringify({ id: crypto.randomUUID(), type: 'trip.searched', occurredAt: new Date().toISOString(), origin, destination, date: date || null, route: `${origin} → ${destination}` }) }] });
    res.status(202).json({ accepted: true });
  } catch (error) { next(error); }
});
app.get('/analytics/revenue', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
    const { rows } = await pool.query(
      `SELECT to_char(date_trunc('day', occurred_at), 'YYYY-MM-DD') AS day,
              COALESCE(SUM((payload->>'amount')::numeric), 0) AS revenue
       FROM analytics_events WHERE event_type = 'payment.completed'
       AND occurred_at >= now() - ($1::text || ' days')::interval
       GROUP BY 1 ORDER BY 1`, [days]);
    res.json({ days, data: rows });
  } catch (error) { next(error); }
});
app.get('/analytics/bookings-by-route', async (_, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT COALESCE(payload->>'route', payload->>'tripId') AS route, COUNT(*)::int AS bookings
      FROM analytics_events WHERE event_type = 'booking.created' GROUP BY 1 ORDER BY bookings DESC LIMIT 10`);
    res.json({ data: rows });
  } catch (error) { next(error); }
});
app.get('/analytics/popular-routes', async (_, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT COALESCE(payload->>'route', concat_ws(' → ', payload->>'origin', payload->>'destination')) AS route, COUNT(*)::int AS searches
      FROM analytics_events WHERE event_type = 'trip.searched' GROUP BY 1 ORDER BY searches DESC LIMIT 10`);
    res.json({ data: rows });
  } catch (error) { next(error); }
});
app.get('/analytics/conversion', async (_, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT
      COUNT(*) FILTER (WHERE event_type = 'trip.searched')::int AS searches,
      COUNT(*) FILTER (WHERE event_type = 'booking.created')::int AS bookings
      FROM analytics_events`);
    const { searches, bookings } = rows[0];
    res.json({ searches, bookings, conversionRate: searches ? Number(bookings) / Number(searches) : 0 });
  } catch (error) { next(error); }
});
app.use((error, _, res, __) => { console.error(error); res.status(500).json({ error: 'Analytics query failed' }); });

await prepareDatabase();
await startConsumer();
app.listen(port, () => console.log(`Analytics service listening on :${port}`));
