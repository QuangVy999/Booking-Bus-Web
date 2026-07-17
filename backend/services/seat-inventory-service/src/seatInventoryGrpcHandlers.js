import grpc from '@grpc/grpc-js';

function toGrpcError(error) {
  const message = error.message || 'Unknown seat inventory service error';
  
  if (message.startsWith('INVALID_ARGUMENT')) {
    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: message
    };
  }

  return {
    code: grpc.status.INTERNAL,
    message: message
  };
}

export function createSeatInventoryGrpcHandlers(seatInventoryService) {
  return {
    async holdSeats(call, callback) {
      try {
        const { trip_id, seat_numbers, booking_id } = call.request;
        const result = await seatInventoryService.holdSeats(trip_id, seat_numbers, booking_id);
        
        callback(null, {
          success: result.success,
          message: result.message,
          expiry_timestamp: result.expiry_timestamp || result.expiryTimestamp
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async confirmSeats(call, callback) {
      try {
        const { trip_id, seat_numbers } = call.request;
        const result = await seatInventoryService.confirmSeats(trip_id, seat_numbers);
        
        callback(null, {
          success: result.success,
          message: result.message
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async releaseSeats(call, callback) {
      try {
        const { trip_id, seat_numbers } = call.request;
        const result = await seatInventoryService.releaseSeats(trip_id, seat_numbers);
        
        callback(null, {
          success: result.success,
          message: result.message
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getSeatInventory(call, callback) {
      try {
        const { trip_id } = call.request;
        const result = await seatInventoryService.getSeatInventory(trip_id);
        
        const grpcSeats = result.seats.map(s => ({
          seat_number: s.seatNumber,
          status: s.status,
          booking_id: s.bookingId
        }));

        callback(null, {
          trip_id: result.tripId,
          seats: grpcSeats
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async blockSeats(call, callback) {
      try {
        const { trip_id, seat_numbers } = call.request;
        const result = await seatInventoryService.blockSeats(trip_id, seat_numbers);
        
        callback(null, {
          success: result.success,
          message: result.message
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
