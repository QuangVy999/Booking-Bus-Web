import { PubSub } from 'graphql-subscriptions';
import Redis from 'ioredis';

export const pubsub = new PubSub();

// Connect to Redis to listen for seat updates from microservices
const redis = new Redis('redis://localhost:6380');

redis.subscribe('seat_updates', (err, count) => {
  if (err) {
    console.error('Failed to subscribe to seat_updates:', err);
  } else {
    console.log(`Subscribed to seat_updates channel`);
  }
});

redis.on('message', (channel, message) => {
  if (channel === 'seat_updates') {
    try {
      const data = JSON.parse(message);
      // Publish to GraphQL Subscriptions
      pubsub.publish('SEAT_UPDATED', { seatUpdated: data });
    } catch (e) {
      console.error('Error parsing redis message', e);
    }
  }
});
