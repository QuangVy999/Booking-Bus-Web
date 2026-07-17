import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_PROTO_PATH = path.resolve(__dirname, '../../protos/user.proto');
const BOOKING_PROTO_PATH = path.resolve(__dirname, '../../protos/booking.proto');

const loadOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};
const packageDefinition = protoLoader.loadSync(USER_PROTO_PATH, loadOptions);
const bookingDefinition = protoLoader.loadSync(BOOKING_PROTO_PATH, loadOptions);

const userProto = grpc.loadPackageDefinition(packageDefinition).user;
const bookingProto = grpc.loadPackageDefinition(bookingDefinition).booking;

const userClient = new userProto.UserService(
  process.env.USER_SERVICE_ADDR || 'localhost:50051',
  grpc.credentials.createInsecure()
);
const bookingClient = new bookingProto.BookingService(
  process.env.BOOKING_SERVICE_ADDR || 'localhost:50053',
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
  booking: bookingClient,
};
