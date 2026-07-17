import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEAT_PROTO_PATH = path.resolve(__dirname, '../../../protos/seat_inventory.proto');
const BOOKING_PROTO_PATH = path.resolve(__dirname, '../../../protos/booking.proto');

const seatDef = protoLoader.loadSync(SEAT_PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const bookingDef = protoLoader.loadSync(BOOKING_PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });

const seatProto = grpc.loadPackageDefinition(seatDef).seat_inventory;
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;

const seatClient = new seatProto.SeatInventoryService('localhost:50052', grpc.credentials.createInsecure());
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
  console.log('--- STARTING BACKEND INTEGRATION TEST ---');
  const tripId = 'trip_hcm_dalat_001';
  const seatNumbers = ['A05', 'A06'];

  try {
    console.log('\n[Step 1] Fetching initial seat inventory...');
    const inv1 = await callUnary(seatClient, 'GetSeatInventory', { trip_id: tripId });
    const targetSeats1 = inv1.seats.filter(s => seatNumbers.includes(s.seat_number));
    console.log('Target seats states:', targetSeats1);

    console.log('\n[Step 2] Creating booking for seats A05, A06...');
    const bookingRes = await callUnary(bookingClient, 'CreateBooking', {
      trip_id: tripId,
      seat_numbers: seatNumbers,
      passenger_name: 'Nguyen Van Test',
      passenger_email: 'test@example.com',
      passenger_phone: '0987654321'
    });
    console.log('Booking created:', bookingRes);
    const bookingId = bookingRes.booking_id;

    console.log('\n[Step 3] Fetching inventory after holding seats...');
    const inv2 = await callUnary(seatClient, 'GetSeatInventory', { trip_id: tripId });
    const targetSeats2 = inv2.seats.filter(s => seatNumbers.includes(s.seat_number));
    console.log('Target seats states:', targetSeats2);

    console.log('\n[Step 4] Confirming payment for booking...');
    const payRes = await callUnary(bookingClient, 'ConfirmPayment', { booking_id: bookingId });
    console.log('Payment confirmation response:', payRes);

    console.log('\n[Step 5] Fetching inventory after payment confirmation...');
    const inv3 = await callUnary(seatClient, 'GetSeatInventory', { trip_id: tripId });
    const targetSeats3 = inv3.seats.filter(s => seatNumbers.includes(s.seat_number));
    console.log('Target seats states:', targetSeats3);

    console.log('\n[Step 6] Retrieving booking details...');
    const bookingInfo = await callUnary(bookingClient, 'GetBooking', { booking_id: bookingId });
    console.log('Booking Info details:', bookingInfo);

    console.log('\n--- INTEGRATION TEST COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n!!! TEST FAILED WITH ERROR:', error);
  }
}

run();
