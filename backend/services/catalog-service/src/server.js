import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

import { db } from './db.js';
import { redis } from './redis.js';
import { catalogRepository } from './catalogRepository.js';
import { createCatalogService } from './catalogService.js';
import { createCatalogGrpcHandlers } from './catalogGrpcHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../protos/catalog.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

const service = createCatalogService(catalogRepository);
const handlers = createCatalogGrpcHandlers(service);

const grpcServer = new grpc.Server();

grpcServer.addService(catalogProto.CatalogService.service, handlers);

const grpcAddress = process.env.GRPC_ADDRESS || '0.0.0.0:50054';

grpcServer.bindAsync(
  grpcAddress,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('Failed to bind gRPC server:', error);
      process.exit(1);
    }
    console.log(`Catalog & Search gRPC Service listening on ${grpcAddress}`);
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
