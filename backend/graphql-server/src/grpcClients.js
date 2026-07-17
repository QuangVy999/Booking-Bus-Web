import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_PROTO = path.resolve(__dirname, '../../protos/user.proto');
const TRIP_PROTO = path.resolve(__dirname, '../../protos/trip.proto');
const BOOKING_PROTO = path.resolve(__dirname, '../../protos/booking.proto');
const SEAT_PROTO = path.resolve(__dirname, '../../protos/seat_inventory.proto');

const loaderOptions = { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true };

const userDef = protoLoader.loadSync(USER_PROTO, loaderOptions);
const tripDef = protoLoader.loadSync(TRIP_PROTO, loaderOptions);
const bookingDef = protoLoader.loadSync(BOOKING_PROTO, loaderOptions);
const seatDef = protoLoader.loadSync(SEAT_PROTO, loaderOptions);

const userProto = grpc.loadPackageDefinition(userDef).user;
const tripProto = grpc.loadPackageDefinition(tripDef).trip;
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;
const seatProto = grpc.loadPackageDefinition(seatDef).seat_inventory;

const userClient = new userProto.UserService(process.env.USER_SERVICE_ADDR || 'localhost:50051', grpc.credentials.createInsecure());
const tripClient = new tripProto.TripService(process.env.TRIP_SERVICE_ADDR || 'localhost:50054', grpc.credentials.createInsecure());
const bookingClient = new bookingProto.BookingService(process.env.BOOKING_SERVICE_ADDR || 'localhost:50052', grpc.credentials.createInsecure());
const seatClient = new seatProto.SeatInventoryService(process.env.SEAT_INVENTORY_SERVICE_ADDR || 'localhost:50053', grpc.credentials.createInsecure());

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
  trip: tripClient,
  booking: bookingClient,
  seat: seatClient
};
