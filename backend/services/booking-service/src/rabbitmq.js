import amqp from 'amqplib';
import 'dotenv/config';

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5673';
const EXCHANGE_NAME = 'booking.events';
const EXCHANGE_TYPE = 'topic';

let channel = null;

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    console.log(`Connected to RabbitMQ at ${rabbitmqUrl}`);
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    // In production, we would retry or crash, for now we will just log
  }
}

export async function publishBookingEvent(routingKey, message) {
  if (!channel) {
    console.error('RabbitMQ channel is not initialized, event was not sent.');
    return false;
  }
  try {
    const payload = Buffer.from(JSON.stringify(message));
    channel.publish(EXCHANGE_NAME, routingKey, payload, { persistent: true });
    console.log(`Published event to RabbitMQ on exchange [${EXCHANGE_NAME}] with routing key [${routingKey}]`);
    return true;
  } catch (error) {
    console.error('Failed to publish event to RabbitMQ:', error);
    return false;
  }
}
