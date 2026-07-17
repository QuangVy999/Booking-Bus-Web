import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKING_PROTO_PATH = path.resolve(__dirname, '../../../protos/booking.proto');
const bookingDef = protoLoader.loadSync(BOOKING_PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;
const bookingClient = new bookingProto.BookingService('localhost:50053', grpc.credentials.createInsecure());

function callUnary(client, methodName, request) {
  return new Promise((resolve, reject) => {
    client[methodName](request, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

async function run() {
  console.log('--- STARTING CONCURRENCY TEST ---');
  // Use a random seat number to ensure it's not already booked
  const tripId = 'trip_hcm_dalat_001';
  const seatNumbers = ['A09']; 

  const req1 = {
    trip_id: tripId,
    seat_numbers: seatNumbers,
    passenger_name: 'User One',
    passenger_email: 'user1@example.com',
    passenger_phone: '0900000001'
  };

  const req2 = {
    trip_id: tripId,
    seat_numbers: seatNumbers,
    passenger_name: 'User Two',
    passenger_email: 'user2@example.com',
    passenger_phone: '0900000002'
  };

  console.log(`[Test] Two users trying to book seat ${seatNumbers} on trip ${tripId} at the exact same time...`);
  
  const results = await Promise.allSettled([
    callUnary(bookingClient, 'CreateBooking', req1),
    callUnary(bookingClient, 'CreateBooking', req2)
  ]);

  let successCount = 0;
  let failCount = 0;

  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      console.log(`[Result ${index + 1}] SUCCESS. Booking ID: ${res.value.booking_id}`);
      successCount++;
    } else {
      console.log(`[Result ${index + 1}] FAILED. Reason: ${res.reason.message}`);
      failCount++;
    }
  });

  if (successCount === 1 && failCount === 1) {
    console.log('\n✅ TEST PASSED: Concurrency handled correctly (Only one booking succeeded).');
  } else {
    console.log(`\n❌ TEST FAILED: Expected 1 success and 1 fail, got ${successCount} successes and ${failCount} fails.`);
  }
}

run();
