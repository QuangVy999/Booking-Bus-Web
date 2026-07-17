import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { db } from './db.js';
import { createUserRepository } from './userRepository.js';
import { createUserService } from './userService.js';
import { createUserGrpcHandlers } from './userGrpcHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../protos/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const repository = createUserRepository(db);
const service = createUserService(repository);
const handlers = createUserGrpcHandlers(service);

const grpcServer = new grpc.Server();
grpcServer.addService(userProto.UserService.service, handlers);

const grpcAddress = process.env.GRPC_ADDRESS || '0.0.0.0:50051';

grpcServer.bindAsync(
  grpcAddress,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`user-service gRPC listening on ${grpcAddress}`);
    grpcServer.start(); // For older grpc-js versions, start() is needed
  }
);

process.on('SIGTERM', async () => {
  console.log('user-service received SIGTERM');
  grpcServer.tryShutdown(async () => {
    console.log('gRPC server closed.');
    await db.destroy();
    console.log('Database connection destroyed.');
    process.exit(0);
  });
});
