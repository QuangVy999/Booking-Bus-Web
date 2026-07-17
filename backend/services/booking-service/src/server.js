import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

import { db } from './db.js';
import { connectRabbitMQ } from './rabbitmq.js';
import { seatInventoryGateway } from './seatInventoryGateway.js';
import { createBookingRepository } from './bookingRepository.js';
import { createBookingService } from './bookingService.js';
import { createBookingGrpcHandlers } from './bookingGrpcHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../protos/booking.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const bookingProto = grpc.loadPackageDefinition(packageDefinition).booking;

const repository = createBookingRepository(db);
const service = createBookingService(repository, seatInventoryGateway);
const handlers = createBookingGrpcHandlers(service);

const grpcServer = new grpc.Server();

grpcServer.addService(bookingProto.BookingService.service, handlers);

const grpcAddress = process.env.GRPC_ADDRESS || '0.0.0.0:50053';

async function main() {
  await connectRabbitMQ();
  
  grpcServer.bindAsync(
    grpcAddress,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to bind gRPC server:', error);
        process.exit(1);
      }
      console.log(`Booking gRPC Service listening on ${grpcAddress}`);
    }
  );
}

main().catch(error => {
  console.error('Failed to start Booking Service:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  grpcServer.tryShutdown(async () => {
    console.log('gRPC server closed.');
    await db.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  grpcServer.tryShutdown(async () => {
    console.log('gRPC server closed.');
    await db.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  });
});
