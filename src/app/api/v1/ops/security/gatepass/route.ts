import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, driverId, passengerCount, loadDescription } = body;
    const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    const { data, error } = await supabaseAdmin
      .from('gate_passes')
      .insert({
        organization_id: ORG_ID,
        vehicle_id: vehicleId,
        driver_id: driverId,
        passenger_count: passengerCount,
        load_description: loadDescription,
        qr_code: crypto.randomUUID() // Simplified Unique Token
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, pass: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
