import { db } from './db.js';
import { createBookingRepository } from './bookingRepository.js';
import { seatInventoryGateway } from './seatInventoryGateway.js';
import { tripGateway } from './tripGateway.js';
import { createBookingService } from './bookingService.js';

const repository = createBookingRepository(db);
const bookingService = createBookingService(repository, seatInventoryGateway, tripGateway);

const EXPIRY_MINUTES = 5;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute

async function checkExpiredBookings() {
  try {
    const expiredBookings = await repository.getExpiredPendingBookings(EXPIRY_MINUTES);
    
    if (expiredBookings.length > 0) {
      console.log(`[Worker] Found ${expiredBookings.length} expired bookings in PENDING_PAYMENT state.`);
      
      for (const booking of expiredBookings) {
        try {
          console.log(`[Worker] Cancelling booking ${booking.booking_code} (ID: ${booking.id})`);
          await bookingService.cancelBooking(booking.id);
        } catch (error) {
          console.error(`[Worker] Error cancelling booking ${booking.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('[Worker] Error checking expired bookings:', error);
  }
}

let workerInterval = null;

export function startExpiryWorker() {
  if (workerInterval) return;
  console.log(`[Worker] Started Booking Expiry Worker (checking every ${CHECK_INTERVAL_MS / 1000}s)`);
  workerInterval = setInterval(checkExpiredBookings, CHECK_INTERVAL_MS);
  
  // Run immediately on start
  checkExpiredBookings();
}

export function stopExpiryWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('[Worker] Stopped Booking Expiry Worker');
  }
}
