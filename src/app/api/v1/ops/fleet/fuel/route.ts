import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, tripId, liters, odometer, cost } = body;
    const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 1. Validate Trip
    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required for fuel dispensing." }, { status: 400 });
    }

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('vehicle_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
       return NextResponse.json({ error: "Invalid Trip ID." }, { status: 400 });
    }

    // 2. Validate Consumption (Simple Logic: If liters > 200, flag warning, but here we just process)
    // In a full implementation, we would compare (trip.distance / vehicle.consumption) vs liters.

    // 3. Insert Fuel Log
    const { data: log, error: logError } = await supabaseAdmin
      .from('fuel_logs')
      .insert({
        organization_id: ORG_ID,
        vehicle_id: vehicleId,
        trip_id: tripId,
        liters: liters,
        cost: cost,
        odometer: odometer
      })
      .select()
      .single();

    if (logError) throw logError;

    // 4. Update Vehicle Odometer
    const { error: updateError } = await supabaseAdmin
      .from('vehicles')
      .update({ current_km: odometer })
      .eq('id', vehicleId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, log });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
