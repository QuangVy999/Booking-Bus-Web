import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../protos/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const CATALOG_PROTO_PATH = path.resolve(__dirname, '../../protos/catalog.proto');
const catalogPackageDefinition = protoLoader.loadSync(CATALOG_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const catalogProto = grpc.loadPackageDefinition(catalogPackageDefinition).catalog;

const userClient = new userProto.UserService(
  process.env.USER_SERVICE_ADDR || 'localhost:50051',
  grpc.credentials.createInsecure()
);

const catalogClient = new catalogProto.CatalogService(
  process.env.CATALOG_SERVICE_ADDR || 'localhost:50054',
  grpc.credentials.createInsecure()
);

export function callUnary(client, method, request, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + timeoutMs);
    client[method](request, { deadline }, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
}

export const grpcClients = {
  user: userClient,
  catalog: catalogClient
};
