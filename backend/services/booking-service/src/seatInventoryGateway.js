import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

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

const seatInventoryGrpcUrl = process.env.SEAT_INVENTORY_GRPC_URL || 'localhost:50052';
const client = new seatInventoryProto.SeatInventoryService(
  seatInventoryGrpcUrl,
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

export const seatInventoryGateway = {
  async holdSeats(tripId, seatNumbers, bookingId) {
    try {
      const response = await callUnary('HoldSeats', {
        trip_id: tripId,
        seat_numbers: seatNumbers,
        booking_id: bookingId
      });
      return {
        success: response.success,
        message: response.message,
        expiryTimestamp: response.expiry_timestamp
      };
    } catch (error) {
      console.error('gRPC holdSeats failed:', error);
      throw error;
    }
  },

  async confirmSeats(tripId, seatNumbers) {
    try {
      const response = await callUnary('ConfirmSeats', {
        trip_id: tripId,
        seat_numbers: seatNumbers
      });
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('gRPC confirmSeats failed:', error);
      throw error;
    }
  },

  async releaseSeats(tripId, seatNumbers) {
    try {
      const response = await callUnary('ReleaseSeats', {
        trip_id: tripId,
        seat_numbers: seatNumbers
      });
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('gRPC releaseSeats failed:', error);
      throw error;
    }
  }
};
