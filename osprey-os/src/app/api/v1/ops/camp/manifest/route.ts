import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // Fetch guests currently in house or arriving (Logic: Booking overlaps today)
  // For demo, we just fetch all active bookings guests
  const { data, error } = await supabaseAdmin
    .from('guests')
    .select(`
      id,
      full_name,
      allergies,
      rooms ( name, status ),
      bookings ( reference_number, start_date, end_date )
    `)
    .eq('organization_id', ORG_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform for frontend
  const manifest = data.map((g: any) => ({
    id: g.id,
    full_name: g.full_name,
    allergies: g.allergies,
    room_name: g.rooms?.name || 'Unassigned',
    room_status: g.rooms?.status || 'active',
    booking_ref: g.bookings?.reference_number,
    arrival: g.bookings?.start_date,
    departure: g.bookings?.end_date
  }));

  return NextResponse.json({ data: manifest });
}
