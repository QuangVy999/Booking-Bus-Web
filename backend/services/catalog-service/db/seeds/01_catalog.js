export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('trips').del();
  await knex('vehicles').del();
  await knex('routes').del();

  // Insert Routes
  await knex('routes').insert([
    {
      id: 'route_hcm_dalat',
      origin: 'TP.HCM',
      destination: 'Đà Lạt',
      distance: 310.5,
      duration: '6 giờ'
    },
    {
      id: 'route_hcm_nhatrang',
      origin: 'TP.HCM',
      destination: 'Nha Trang',
      distance: 430.0,
      duration: '8 giờ'
    },
    {
      id: 'route_hcm_cantho',
      origin: 'TP.HCM',
      destination: 'Cần Thơ',
      distance: 170.0,
      duration: '3.5 giờ'
    },
    {
      id: 'route_hanoi_haiphong',
      origin: 'Hà Nội',
      destination: 'Hải Phòng',
      distance: 120.0,
      duration: '2 giờ'
    }
  ]);

  // Insert Vehicles
  await knex('vehicles').insert([
    {
      id: 'vehicle_sleeper_34',
      plate_number: '51B-123.45',
      type: 'Giường nằm 34 chỗ',
      capacity: 34
    },
    {
      id: 'vehicle_limousine_22',
      plate_number: '51B-678.90',
      type: 'Limousine 22 chỗ',
      capacity: 22
    },
    {
      id: 'vehicle_regular_29',
      plate_number: '29B-999.99',
      type: 'Ghế ngồi 29 chỗ',
      capacity: 29
    }
  ]);

  // Insert Trips (including trip_test_001)
  await knex('trips').insert([
    {
      id: 'trip_test_001',
      route_id: 'route_hcm_dalat',
      vehicle_id: 'vehicle_sleeper_34',
      departure_time: '2026-07-27T00:00:00Z',
      arrival_time: '2026-07-27T06:00:00Z',
      price: 250000,
      status: 'OPEN',
      bus_company: 'Phương Trang Demo'
    },
    {
      id: 'trip_hcm_dalat_morning',
      route_id: 'route_hcm_dalat',
      vehicle_id: 'vehicle_limousine_22',
      departure_time: '2026-07-18T08:00:00Z',
      arrival_time: '2026-07-18T14:00:00Z',
      price: 350000,
      status: 'OPEN',
      bus_company: 'Thành Bưởi Demo'
    },
    {
      id: 'trip_hcm_nhatrang_night',
      route_id: 'route_hcm_nhatrang',
      vehicle_id: 'vehicle_sleeper_34',
      departure_time: '2026-07-18T22:00:00Z',
      arrival_time: '2026-07-19T06:00:00Z',
      price: 280000,
      status: 'OPEN',
      bus_company: 'Kumho Demo'
    },
    {
      id: 'trip_hcm_cantho_express',
      route_id: 'route_hcm_cantho',
      vehicle_id: 'vehicle_regular_29',
      departure_time: '2026-07-18T10:00:00Z',
      arrival_time: '2026-07-18T13:30:00Z',
      price: 180000,
      status: 'OPEN',
      bus_company: 'Phương Trang Demo'
    }
  ]);
};
