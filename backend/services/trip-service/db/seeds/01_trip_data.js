/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes ALL existing entries in reverse order of foreign keys
  await knex('trips').del();
  await knex('vehicles').del();
  await knex('routes').del();
  await knex('stops').del();

  const stop1 = 'f78c8fc9-33aa-4bf1-8dc1-2df8b1a41a4a';
  const stop2 = 'b677a280-994c-473d-82d6-056edc9cf6cd';
  const stop3 = 'd9494a86-7a71-4a4b-9c60-ecbcbe842e23';
  const stop4 = '8c3be5b0-0dbd-4f11-9a4d-045a507f3ed6';
  const stop5 = 'a1194a86-7a71-4a4b-9c60-ecbcbe842e25'; // Nha Trang
  const stop6 = 'b2294a86-7a71-4a4b-9c60-ecbcbe842e26'; // Hải Phòng
  const stop7 = 'c3394a86-7a71-4a4b-9c60-ecbcbe842e27'; // Đà Nẵng

  await knex('stops').insert([
    { id: stop1, name: 'Bến xe Miền Đông', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM' },
    { id: stop2, name: 'Bến xe Cần Thơ', address: 'QL1A, Hưng Thành, Cái Răng, Cần Thơ' },
    { id: stop3, name: 'Bến xe Liên tỉnh Đà Lạt', address: '1 Tô Hiến Thành, Phường 3, Đà Lạt' },
    { id: stop4, name: 'Bến xe Mỹ Đình', address: '20 Phạm Hùng, Mỹ Đình, Hà Nội' },
    { id: stop5, name: 'Bến xe Phía Nam Nha Trang', address: '58 Đường 23/10, Nha Trang, Khánh Hòa' },
    { id: stop6, name: 'Bến xe Vĩnh Niệm', address: 'Bùi Viện, Vĩnh Niệm, Lê Chân, Hải Phòng' },
    { id: stop7, name: 'Bến xe Trung tâm Đà Nẵng', address: '201 Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng' }
  ]);

  const route1 = '623de222-3bb0-4211-9b16-43d9396de330';
  const route2 = 'c13c7cba-cd8c-4217-bf30-4eec031a08ab';
  const route3 = '15e7144e-128f-4ed7-94d0-522ee6b3346e';
  const route4 = '3620e9ad-654d-4be9-aa29-87c2fb24fb3b';
  const route5 = 'a12de222-3bb0-4211-9b16-43d9396de331'; // TP.HCM - Nha Trang
  const route6 = 'b23de222-3bb0-4211-9b16-43d9396de332'; // Hà Nội - Hải Phòng
  const route7 = 'c34de222-3bb0-4211-9b16-43d9396de333'; // Đà Nẵng - Đà Lạt
  const route8 = 'd45de222-3bb0-4211-9b16-43d9396de334'; // TP.HCM - Đà Nẵng

  await knex('routes').insert([
    { id: route1, name: 'TP.HCM - Cần Thơ', start_stop_id: stop1, end_stop_id: stop2, origin: 'TP.HCM', destination: 'Cần Thơ', distance: 170, duration: '3.5 giờ' },
    { id: route2, name: 'TP.HCM - Đà Lạt', start_stop_id: stop1, end_stop_id: stop3, origin: 'TP.HCM', destination: 'Đà Lạt', distance: 310, duration: '6 giờ' },
    { id: route3, name: 'Hà Nội - TP.HCM', start_stop_id: stop4, end_stop_id: stop1, origin: 'Hà Nội', destination: 'TP.HCM', distance: 1700, duration: '30 giờ' },
    { id: route4, name: 'Đà Lạt - Cần Thơ', start_stop_id: stop3, end_stop_id: stop2, origin: 'Đà Lạt', destination: 'Cần Thơ', distance: 400, duration: '8 giờ' },
    { id: route5, name: 'TP.HCM - Nha Trang', start_stop_id: stop1, end_stop_id: stop5, origin: 'TP.HCM', destination: 'Nha Trang', distance: 430, duration: '8 giờ' },
    { id: route6, name: 'Hà Nội - Hải Phòng', start_stop_id: stop4, end_stop_id: stop6, origin: 'Hà Nội', destination: 'Hải Phòng', distance: 120, duration: '2 giờ' },
    { id: route7, name: 'Đà Nẵng - Đà Lạt', start_stop_id: stop7, end_stop_id: stop3, origin: 'Đà Nẵng', destination: 'Đà Lạt', distance: 650, duration: '12 giờ' },
    { id: route8, name: 'TP.HCM - Đà Nẵng', start_stop_id: stop1, end_stop_id: stop7, origin: 'TP.HCM', destination: 'Đà Nẵng', distance: 960, duration: '16 giờ' }
  ]);

  const vehicle1 = '2938a163-95af-4b2a-886b-4e9dfd08c5ea';
  const vehicle2 = '9fc1f91d-b8d4-42f0-97db-2fc45618fce1';
  const vehicle3 = 'b233a7ad-3da6-4652-949e-8c3409a2baf4';
  const vehicle4 = '4cf2d3ce-ba67-4a11-aba0-4d4af20736f3';

  const generateSeatMap = (seats) => {
    let map = "";
    for(let i=1; i<=seats; i++) {
      map += `A${i.toString().padStart(2, '0')}`;
      if (i % 4 === 0) map += "\n";
      else map += ",";
    }
    return map;
  };

  await knex('vehicles').insert([
    { id: vehicle1, license_plate: '51B-123.45', plate_number: '51B-123.45', total_seats: 30, capacity: 30, type: 'Ghế ngồi 30 chỗ', seat_map: generateSeatMap(30) },
    { id: vehicle2, license_plate: '65C-987.65', plate_number: '65C-987.65', total_seats: 40, capacity: 40, type: 'Giường nằm 40 chỗ', seat_map: generateSeatMap(40) },
    { id: vehicle3, license_plate: '49D-111.22', plate_number: '49D-111.22', total_seats: 20, capacity: 20, type: 'Limousine 20 chỗ', seat_map: generateSeatMap(20) },
    { id: vehicle4, license_plate: '29A-333.44', plate_number: '29A-333.44', total_seats: 30, capacity: 30, type: 'Ghế ngồi 30 chỗ', seat_map: generateSeatMap(30) }
  ]);

  await knex('trips').insert([
    // TP.HCM - Cần Thơ (route1)
    { id: 'trip_ct_001', route_id: route1, vehicle_id: vehicle1, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T04:30:00.000Z'), price: 150000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_ct_002', route_id: route1, vehicle_id: vehicle1, departure_time: new Date('2026-07-21T01:00:00.000Z'), arrival_time: new Date('2026-07-21T04:30:00.000Z'), price: 150000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_ct_003', route_id: route1, vehicle_id: vehicle1, departure_time: new Date('2026-07-22T01:00:00.000Z'), arrival_time: new Date('2026-07-22T04:30:00.000Z'), price: 150000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // TP.HCM - Đà Lạt (route2)
    { id: '2081e7d2-4d43-467a-85ef-968b57be2bc0', route_id: route2, vehicle_id: vehicle2, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T07:00:00.000Z'), price: 250000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_dl_002', route_id: route2, vehicle_id: vehicle2, departure_time: new Date('2026-07-21T01:00:00.000Z'), arrival_time: new Date('2026-07-21T07:00:00.000Z'), price: 250000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_dl_003', route_id: route2, vehicle_id: vehicle2, departure_time: new Date('2026-07-22T01:00:00.000Z'), arrival_time: new Date('2026-07-22T07:00:00.000Z'), price: 250000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // Hà Nội - TP.HCM (route3)
    { id: 'trip_hn_001', route_id: route3, vehicle_id: vehicle4, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-21T07:00:00.000Z'), price: 800000, status: 'PENDING', bus_company: 'Phương Trang Demo' },

    // Đà Lạt - Cần Thơ (route4)
    { id: 'trip_dc_001', route_id: route4, vehicle_id: vehicle3, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T09:00:00.000Z'), price: 300000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_dc_002', route_id: route4, vehicle_id: vehicle3, departure_time: new Date('2026-07-22T01:00:00.000Z'), arrival_time: new Date('2026-07-22T09:00:00.000Z'), price: 300000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // TP.HCM - Nha Trang (route5)
    { id: 'trip_nt_001', route_id: route5, vehicle_id: vehicle2, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T09:00:00.000Z'), price: 280000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_nt_002', route_id: route5, vehicle_id: vehicle2, departure_time: new Date('2026-07-21T01:00:00.000Z'), arrival_time: new Date('2026-07-21T09:00:00.000Z'), price: 280000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_nt_003', route_id: route5, vehicle_id: vehicle2, departure_time: new Date('2026-07-25T01:00:00.000Z'), arrival_time: new Date('2026-07-25T09:00:00.000Z'), price: 280000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // Hà Nội - Hải Phòng (route6)
    { id: 'trip_hp_001', route_id: route6, vehicle_id: vehicle1, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T03:00:00.000Z'), price: 150000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },
    { id: 'trip_hp_002', route_id: route6, vehicle_id: vehicle1, departure_time: new Date('2026-07-21T01:00:00.000Z'), arrival_time: new Date('2026-07-21T03:00:00.000Z'), price: 150000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // Đà Nẵng - Đà Lạt (route7)
    { id: 'trip_dd_001', route_id: route7, vehicle_id: vehicle4, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T13:00:00.000Z'), price: 400000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // TP.HCM - Đà Nẵng (route8)
    { id: 'trip_dn_001', route_id: route8, vehicle_id: vehicle2, departure_time: new Date('2026-07-20T01:00:00.000Z'), arrival_time: new Date('2026-07-20T17:00:00.000Z'), price: 450000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' },

    // Original Test Booking trip
    { id: 'trip_test_001', route_id: route2, vehicle_id: vehicle2, departure_time: new Date('2026-07-27T01:00:00.000Z'), arrival_time: new Date('2026-07-27T07:00:00.000Z'), price: 250000, status: 'ACTIVE', bus_company: 'Phương Trang Demo' }
  ]);
}
