import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { createSeatInventoryService } from '../src/seatInventoryService.js';

function createMockRepository() {
  return {
    findSeatsByNumbers: jest.fn(),
    updateSeatsStatus: jest.fn(),
    getInventoryByTrip: jest.fn()
  };
}

function createMockRedis() {
  return {
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    mget: jest.fn()
  };
}

describe('SeatInventoryService unit tests', () => {
  let repository;
  let redisClient;
  let service;

  beforeEach(() => {
    repository = createMockRepository();
    redisClient = createMockRedis();
    service = createSeatInventoryService(repository, redisClient);
  });

  test('holdSeats succeeds when all seats are available', async () => {
    const tripId = 'trip_001';
    const seatNumbers = ['A01', 'A02'];
    const bookingId = 'booking_abc';

    repository.findSeatsByNumbers.mockResolvedValue([]);
    redisClient.set.mockResolvedValue('OK');

    const result = await service.holdSeats(tripId, seatNumbers, bookingId);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Seats held successfully');
    expect(result.expiryTimestamp).toBeGreaterThan(Date.now());
    expect(redisClient.set).toHaveBeenCalledTimes(2);
    expect(redisClient.set).toHaveBeenNthCalledWith(1, 'hold:trip_001:A01', bookingId, 'NX', 'EX', 300);
    expect(redisClient.set).toHaveBeenNthCalledWith(2, 'hold:trip_001:A02', bookingId, 'NX', 'EX', 300);
  });

  test('holdSeats fails when a seat is already booked in database', async () => {
    const tripId = 'trip_001';
    const seatNumbers = ['A01', 'A02'];
    const bookingId = 'booking_abc';

    repository.findSeatsByNumbers.mockResolvedValue([
      { seat_number: 'A01', status: 'BOOKED' }
    ]);

    const result = await service.holdSeats(tripId, seatNumbers, bookingId);

    expect(result.success).toBe(false);
    expect(result.message).toContain('already booked');
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  test('holdSeats fails and rolls back when a seat is already held in Redis', async () => {
    const tripId = 'trip_001';
    const seatNumbers = ['A01', 'A02'];
    const bookingId = 'booking_abc';

    repository.findSeatsByNumbers.mockResolvedValue([]);
    redisClient.set
      .mockResolvedValueOnce('OK')
      .mockResolvedValueOnce(null);
    redisClient.del.mockResolvedValue(1);

    const result = await service.holdSeats(tripId, seatNumbers, bookingId);

    expect(result.success).toBe(false);
    expect(result.message).toContain('currently held');
    expect(redisClient.del).toHaveBeenCalledWith('hold:trip_001:A01');
  });

  test('confirmSeats updates status in DB and deletes Redis keys', async () => {
    const tripId = 'trip_001';
    const seatNumbers = ['A01', 'A02'];

    repository.updateSeatsStatus.mockResolvedValue(true);
    redisClient.del.mockResolvedValue(2);

    const result = await service.confirmSeats(tripId, seatNumbers);

    expect(result.success).toBe(true);
    expect(repository.updateSeatsStatus).toHaveBeenCalledWith(tripId, seatNumbers, 'BOOKED');
    expect(redisClient.del).toHaveBeenCalledWith('hold:trip_001:A01', 'hold:trip_001:A02');
  });

  test('releaseSeats deletes Redis keys', async () => {
    const tripId = 'trip_001';
    const seatNumbers = ['A01', 'A02'];

    redisClient.del.mockResolvedValue(2);

    const result = await service.releaseSeats(tripId, seatNumbers);

    expect(result.success).toBe(true);
    expect(redisClient.del).toHaveBeenCalledWith('hold:trip_001:A01', 'hold:trip_001:A02');
  });
});
