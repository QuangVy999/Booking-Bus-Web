import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

import { db } from './db.js';
import { redis } from './redis.js';
import { createSeatInventoryRepository } from './seatInventoryRepository.js';
import { createSeatInventoryService } from './seatInventoryService.js';
import { createSeatInventoryGrpcHandlers } from './seatInventoryGrpcHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../protos/seat_inventory.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const seatInventoryProto = grpc.loadPackageDefinition(packageDefinition).seat_inventory;

const repository = createSeatInventoryRepository(db);
const service = createSeatInventoryService(repository, redis);
const handlers = createSeatInventoryGrpcHandlers(service);

const grpcServer = new grpc.Server();

grpcServer.addService(seatInventoryProto.SeatInventoryService.service, handlers);

const grpcAddress = process.env.GRPC_ADDRESS || '0.0.0.0:50052';

grpcServer.bindAsync(
  grpcAddress,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('Failed to bind gRPC server:', error);
      process.exit(1);
    }
    console.log(`Seat Inventory gRPC Service listening on ${grpcAddress}`);
  }
);

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  grpcServer.tryShutdown(async () => {
    console.log('gRPC server closed.');
    await db.destroy();
    redis.disconnect();
    console.log('Database and Redis connections closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  grpcServer.tryShutdown(async () => {
    console.log('gRPC server closed.');
    await db.destroy();
    redis.disconnect();
    console.log('Database and Redis connections closed.');
    process.exit(0);
  });
});
