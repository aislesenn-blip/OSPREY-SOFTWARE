import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const today = new Date().toISOString().split('T')[0];

  // 1. Get All Staff
  const { data: staff, error: staffError } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('organization_id', ORG_ID);

  if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 });

  // 2. Get Active Rota Count (Staff to be fed)
  // In a real app, we join with staff_rota table.
  // Here we mock it or check if table is populated.
  // We'll return the total active staff as a proxy if rota is empty.

  const { count, error: rotaError } = await supabaseAdmin
    .from('staff_rota')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ORG_ID)
    .eq('date', today)
    .eq('status', 'on_duty');

  const rationCount = count || staff.filter((s:any) => s.is_active).length; // Fallback to all active staff

  return NextResponse.json({
    data: staff,
    meta: {
      ration_count: rationCount,
      ration_unit_cost: 5.50 // Mock cost per meal
    }
  });
}
