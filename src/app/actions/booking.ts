'use server';

import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { revalidatePath } from 'next/cache';

const SEAT_PROTO_PATH = path.resolve(process.cwd(), 'backend/protos/seat_inventory.proto');
const BOOKING_PROTO_PATH = path.resolve(process.cwd(), 'backend/protos/booking.proto');

const seatDef = protoLoader.loadSync(SEAT_PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const bookingDef = protoLoader.loadSync(BOOKING_PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });

const seatProto = grpc.loadPackageDefinition(seatDef).seat_inventory as any;
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking as any;

const seatClient = new seatProto.SeatInventoryService('localhost:50052', grpc.credentials.createInsecure());
const bookingClient = new bookingProto.BookingService('localhost:50053', grpc.credentials.createInsecure());

function callUnary(client: any, methodName: string, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    client[methodName](request, (error: any, response: any) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

// Action: Fetch seat inventory for a trip
export async function getSeatInventoryAction(tripId: string) {
  try {
    const res = await callUnary(seatClient, 'GetSeatInventory', { trip_id: tripId });
    return {
      success: true,
      tripId: res.trip_id,
      seats: res.seats.map((s: any) => ({
        seatNumber: s.seat_number,
        status: s.status,
        bookingId: s.booking_id
      }))
    };
  } catch (error: any) {
    console.error('getSeatInventoryAction failed:', error);
    return { success: false, error: error.message || 'Failed to fetch inventory' };
  }
}

// Action: Create booking (which holds seats)
export async function createBookingAction(prevState: any, formData: FormData) {
  const tripId = formData.get('tripId') as string;
  const seatNumbersStr = formData.get('seatNumbers') as string; // Comma-separated list
  const name = formData.get('passengerName') as string;
  const email = formData.get('passengerEmail') as string;
  const phone = formData.get('passengerPhone') as string;

  if (!tripId || !seatNumbersStr || !name || !email || !phone) {
    return { success: false, message: 'All fields are required' };
  }

  const seatNumbers = seatNumbersStr.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const res = await callUnary(bookingClient, 'CreateBooking', {
      trip_id: tripId,
      seat_numbers: seatNumbers,
      passenger_name: name,
      passenger_email: email,
      passenger_phone: phone
    });

    revalidatePath(`/booking/${tripId}`);

    return {
      success: true,
      bookingId: res.booking_id,
      bookingCode: res.booking_code,
      status: res.status,
      expiryTimestamp: Number(res.expiry_timestamp)
    };
  } catch (error: any) {
    console.error('createBookingAction failed:', error);
    return { success: false, message: error.details || error.message || 'Failed to hold seats' };
  }
}

// Action: Confirm payment
export async function confirmPaymentAction(bookingId: string) {
  try {
    const res = await callUnary(bookingClient, 'ConfirmPayment', { booking_id: bookingId });
    revalidatePath(`/booking/confirmation/${bookingId}`);
    return { success: res.success, status: res.status };
  } catch (error: any) {
    console.error('confirmPaymentAction failed:', error);
    return { success: false, message: error.details || error.message || 'Failed to process payment' };
  }
}

// Action: Cancel booking
export async function cancelBookingAction(bookingId: string) {
  try {
    const res = await callUnary(bookingClient, 'CancelBooking', { booking_id: bookingId });
    revalidatePath(`/booking/confirmation/${bookingId}`);
    return { success: res.success, status: res.status };
  } catch (error: any) {
    console.error('cancelBookingAction failed:', error);
    return { success: false, message: error.details || error.message || 'Failed to cancel booking' };
  }
}

// Action: Fetch booking details
export async function getBookingAction(bookingId: string) {
  try {
    const res = await callUnary(bookingClient, 'GetBooking', { booking_id: bookingId });
    return {
      success: true,
      bookingId: res.booking_id,
      bookingCode: res.booking_code,
      tripId: res.trip_id,
      seatNumbers: res.seat_numbers,
      passengerName: res.passenger_name,
      passengerEmail: res.passenger_email,
      status: res.status
    };
  } catch (error: any) {
    console.error('getBookingAction failed:', error);
    return { success: false, error: error.message || 'Failed to fetch booking details' };
  }
}
