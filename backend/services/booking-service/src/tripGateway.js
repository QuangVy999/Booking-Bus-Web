import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../protos/trip.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const tripProto = grpc.loadPackageDefinition(packageDefinition).trip;

const tripGrpcUrl = process.env.TRIP_GRPC_URL || 'localhost:50054';
const client = new tripProto.TripService(
  tripGrpcUrl,
  grpc.credentials.createInsecure()
);

function callUnary(methodName, request) {
  return new Promise((resolve, reject) => {
    client[methodName](request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export const tripGateway = {
  async getTrips(routeId, status) {
    try {
      const response = await callUnary('GetTrips', { route_id: routeId, status });
      return response.trips || [];
    } catch (error) {
      console.error('gRPC getTrips failed:', error);
      throw error;
    }
  },
  async getTripById(tripId) {
    try {
      const trip = await callUnary('GetTripById', { id: tripId });
      return trip;
    } catch (error) {
      console.error('gRPC getTripById failed:', error);
      throw error;
    }
  }
};
