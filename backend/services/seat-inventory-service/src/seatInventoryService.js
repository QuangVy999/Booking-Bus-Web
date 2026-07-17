export function createSeatInventoryService(repository, redisClient) {
  const HOLD_TTL_SECONDS = 300; // 5 minutes

  return {
    async holdSeats(tripId, seatNumbers, bookingId) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0 || !bookingId) {
        throw new Error('INVALID_ARGUMENT: trip_id, seat_numbers and booking_id are required');
      }

      // 1. Check in Database first
      const dbSeats = await repository.findSeatsByNumbers(tripId, seatNumbers);
      for (const seat of dbSeats) {
        if (seat.status !== 'AVAILABLE') {
          return {
            success: false,
            message: `Seat ${seat.seat_number} is already ${seat.status.toLowerCase()}`,
            expiryTimestamp: 0
          };
        }
      }

      // 2. Attempt to hold in Redis with NX (Not Exists) to prevent concurrent bookings
      const acquiredKeys = [];
      let success = true;
      let failedSeat = '';

      for (const seatNum of seatNumbers) {
        const key = `hold:${tripId}:${seatNum}`;
        const result = await redisClient.set(key, bookingId, 'NX', 'EX', HOLD_TTL_SECONDS);
        if (result === 'OK') {
          acquiredKeys.push(key);
        } else {
          success = false;
          failedSeat = seatNum;
          break;
        }
      }

      // 3. Rollback if any key failed to acquire
      if (!success) {
        if (acquiredKeys.length > 0) {
          await redisClient.del(...acquiredKeys);
        }
        return {
          success: false,
          message: `Seat ${failedSeat} is currently held by another user`,
          expiryTimestamp: 0
        };
      }

      const expiryTimestamp = Date.now() + (HOLD_TTL_SECONDS * 1000);
      return {
        success: true,
        message: 'Seats held successfully',
        expiryTimestamp: expiryTimestamp
      };
    },

    async confirmSeats(tripId, seatNumbers) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0) {
        throw new Error('INVALID_ARGUMENT: trip_id and seat_numbers are required');
      }

      // 1. Update status to BOOKED in DB
      await repository.updateSeatsStatus(tripId, seatNumbers, 'BOOKED');

      // 2. Remove locks from Redis
      const keys = seatNumbers.map(num => `hold:${tripId}:${num}`);
      await redisClient.del(...keys);

      return {
        success: true,
        message: 'Seats confirmed successfully'
      };
    },

    async releaseSeats(tripId, seatNumbers) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0) {
        throw new Error('INVALID_ARGUMENT: trip_id and seat_numbers are required');
      }

      // Remove locks from Redis
      const keys = seatNumbers.map(num => `hold:${tripId}:${num}`);
      await redisClient.del(...keys);

      return {
        success: true,
        message: 'Seats released successfully'
      };
    },

    async getSeatInventory(tripId) {
      if (!tripId) {
        throw new Error('INVALID_ARGUMENT: trip_id is required');
      }

      // 1. Get DB state
      const dbSeats = await repository.getInventoryByTrip(tripId);
      const dbSeatsMap = new Map(dbSeats.map(s => [s.seat_number, s]));

      // 2. Get Redis holds
      const redisKeys = await redisClient.keys(`hold:${tripId}:*`);
      const heldSeatsMap = new Map();
      if (redisKeys.length > 0) {
        const values = await redisClient.mget(...redisKeys);
        redisKeys.forEach((key, index) => {
          const seatNum = key.split(':')[2];
          heldSeatsMap.set(seatNum, values[index]);
        });
      }

      // 3. Define standard seat layout (A01 - A15, B01 - B15) for simulation
      const allSeatNumbers = new Set([
        ...dbSeatsMap.keys(),
        ...heldSeatsMap.keys(),
        ...Array.from({ length: 15 }, (_, i) => `A${String(i+1).padStart(2, '0')}`),
        ...Array.from({ length: 15 }, (_, i) => `B${String(i+1).padStart(2, '0')}`)
      ]);

      const result = [];
      for (const seatNum of allSeatNumbers) {
        const dbSeat = dbSeatsMap.get(seatNum);
        const heldBookingId = heldSeatsMap.get(seatNum);

        let status = 'AVAILABLE';
        let bookingId = '';

        if (dbSeat) {
          status = dbSeat.status;
        } else if (heldBookingId) {
          status = 'HELD';
          bookingId = heldBookingId;
        }

        result.push({
          seatNumber: seatNum,
          status: status,
          bookingId: bookingId
        });
      }

      result.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

      return {
        tripId,
        seats: result
      };
    },

    async blockSeats(tripId, seatNumbers) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0) {
        throw new Error('INVALID_ARGUMENT: trip_id and seat_numbers are required');
      }

      // 1. Check if any seat is already booked in database
      const dbSeats = await repository.findSeatsByNumbers(tripId, seatNumbers);
      for (const seat of dbSeats) {
        if (seat.status === 'BOOKED') {
          return {
            success: false,
            message: `Seat ${seat.seat_number} is already booked and cannot be blocked`
          };
        }
      }

      // 2. Update status to BLOCKED in DB
      await repository.updateSeatsStatus(tripId, seatNumbers, 'BLOCKED');

      // 3. Remove locks from Redis if they were held
      const keys = seatNumbers.map(num => `hold:${tripId}:${num}`);
      await redisClient.del(...keys);

      return {
        success: true,
        message: 'Seats blocked successfully'
      };
    },

    async unblockSeats(tripId, seatNumbers) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0) {
        throw new Error('INVALID_ARGUMENT: trip_id and seat_numbers are required');
      }

      // 1. Update status to AVAILABLE in DB
      await repository.updateSeatsStatus(tripId, seatNumbers, 'AVAILABLE');

      return {
        success: true,
        message: 'Seats unblocked successfully'
      };
    }
  };
}
