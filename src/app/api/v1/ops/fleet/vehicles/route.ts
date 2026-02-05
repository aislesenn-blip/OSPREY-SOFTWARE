import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const { data: vehicles, error } = await supabaseAdmin
    .from('vehicles')
    .select('*')
    .eq('organization_id', ORG_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute status dynamic override
  const vehiclesWithStatus = vehicles.map((v: any) => {
    const isOverdue = Number(v.current_km) > Number(v.service_due_km);
    return {
      ...v,
      is_overdue: isOverdue,
      status: isOverdue ? 'blocked' : v.status
    };
  });

  return NextResponse.json({ data: vehiclesWithStatus });
}
