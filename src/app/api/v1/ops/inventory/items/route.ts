import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  // In a real app, we would validate the session here.
  // For this demo, we fetch items for the Baobab Organization.
  const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .select('*')
    .eq('organization_id', ORG_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
