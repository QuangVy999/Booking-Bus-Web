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

  await knex('stops').insert([
    { id: stop1, name: 'Bến xe Miền Đông', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM' },
    { id: stop2, name: 'Bến xe Cần Thơ', address: 'QL1A, Hưng Thành, Cái Răng, Cần Thơ' },
    { id: stop3, name: 'Bến xe Liên tỉnh Đà Lạt', address: '1 Tô Hiến Thành, Phường 3, Đà Lạt' },
    { id: stop4, name: 'Bến xe Mỹ Đình', address: '20 Phạm Hùng, Mỹ Đình, Hà Nội' }
  ]);

  const route1 = '623de222-3bb0-4211-9b16-43d9396de330';
  const route2 = 'c13c7cba-cd8c-4217-bf30-4eec031a08ab';
  const route3 = '15e7144e-128f-4ed7-94d0-522ee6b3346e';
  const route4 = '3620e9ad-654d-4be9-aa29-87c2fb24fb3b';

  await knex('routes').insert([
    { id: route1, name: 'TP.HCM - Cần Thơ', start_stop_id: stop1, end_stop_id: stop2 },
    { id: route2, name: 'TP.HCM - Đà Lạt', start_stop_id: stop1, end_stop_id: stop3 },
    { id: route3, name: 'Hà Nội - TP.HCM', start_stop_id: stop4, end_stop_id: stop1 },
    { id: route4, name: 'Đà Lạt - Cần Thơ', start_stop_id: stop3, end_stop_id: stop2 }
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
    { id: vehicle1, license_plate: '51B-123.45', total_seats: 30, seat_map: generateSeatMap(30) },
    { id: vehicle2, license_plate: '65C-987.65', total_seats: 40, seat_map: generateSeatMap(40) },
    { id: vehicle3, license_plate: '49D-111.22', total_seats: 20, seat_map: generateSeatMap(20) },
    { id: vehicle4, license_plate: '29A-333.44', total_seats: 30, seat_map: generateSeatMap(30) }
  ]);

  const now = new Date();
  const nextDay = new Date(now); nextDay.setDate(now.getDate() + 1);
  const nextDayArr = new Date(nextDay); nextDayArr.setHours(nextDayArr.getHours() + 4);

  const next2Days = new Date(now); next2Days.setDate(now.getDate() + 2);
  const next2DaysArr = new Date(next2Days); next2DaysArr.setHours(next2DaysArr.getHours() + 6);

  await knex('trips').insert([
    { 
      id: '8118029d-43c2-4809-b472-e5b155f9e802', 
      route_id: route1, 
      vehicle_id: vehicle1, 
      departure_time: nextDay, 
      arrival_time: nextDayArr, 
      price: 150000, 
      status: 'ACTIVE' 
    },
    { 
      id: '2081e7d2-4d43-467a-85ef-968b57be2bc0', 
      route_id: route2, 
      vehicle_id: vehicle2, 
      departure_time: next2Days, 
      arrival_time: next2DaysArr, 
      price: 250000, 
      status: 'ACTIVE' 
    },
    { 
      id: 'f8eb738d-0b60-4b2a-ae7b-231a44c52f6b', 
      route_id: route3, 
      vehicle_id: vehicle4, 
      departure_time: nextDay, 
      arrival_time: new Date(nextDay.getTime() + 30 * 3600000), 
      price: 800000, 
      status: 'PENDING' 
    },
    { 
      id: 'a71e847c-502a-4424-aa80-e8f00db1f855', 
      route_id: route4, 
      vehicle_id: vehicle3, 
      departure_time: next2Days, 
      arrival_time: new Date(next2Days.getTime() + 8 * 3600000), 
      price: 300000, 
      status: 'ACTIVE' 
    }
  ]);
}
