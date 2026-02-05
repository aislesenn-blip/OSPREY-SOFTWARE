export interface Guest {
  id: string;
  full_name: string;
  allergies?: string;
  room_name: string;
  booking_ref: string;
  arrival_date: string;
  departure_date: string;
}

export interface Room {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
}
