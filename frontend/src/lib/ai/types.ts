export interface Trip {
  id: string;
  route: string; // VD: Sài Gòn - Đà Lạt
  departureTime: string;
  price: number;
  totalSeats: number;
  bookedSeats: number;
  status: "OPEN" | "CLOSED" | "DEPARTED";
  busCompany: string;
}

export interface Booking {
  id: string;
  tripId: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  trip: Trip;
}
