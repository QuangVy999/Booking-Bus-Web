import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRIP_PROTO = path.resolve(__dirname, '../../../protos/trip.proto');
const BOOKING_PROTO = path.resolve(__dirname, '../../../protos/booking.proto');

const loaderOptions = { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true };

const tripDef = protoLoader.loadSync(TRIP_PROTO, loaderOptions);
const bookingDef = protoLoader.loadSync(BOOKING_PROTO, loaderOptions);

const tripProto = grpc.loadPackageDefinition(tripDef).trip;
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;

const tripClient = new tripProto.TripService(process.env.TRIP_SERVICE_ADDR || 'localhost:50054', grpc.credentials.createInsecure());
const bookingClient = new bookingProto.BookingService(process.env.BOOKING_SERVICE_ADDR || 'localhost:50053', grpc.credentials.createInsecure());

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
  trip: tripClient,
  booking: bookingClient
};
