import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // Fetch entries with lines and accounts
  const { data, error } = await supabaseAdmin
    .from('ledger_entries')
    .select(`
      *,
      ledger_lines (
        debit,
        credit,
        ledger_accounts ( name, code, type )
      )
    `)
    .eq('organization_id', ORG_ID)
    .order('transaction_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
