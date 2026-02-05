import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, quantity, locationId, reference } = body;
    const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 1. Create Transaction
    const { data: transaction, error: transError } = await supabaseAdmin
      .from('inventory_transactions')
      .insert({
        organization_id: ORG_ID,
        item_id: itemId,
        to_location_id: locationId,
        quantity: quantity,
        type: 'receive',
        status: 'completed',
        reference: reference
      })
      .select()
      .single();

    if (transError) throw transError;

    // 2. Update Stock (Simple increment for demo)
    // Check if stock record exists
    const { data: stock, error: stockFetchError } = await supabaseAdmin
        .from('inventory_stock')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .single();

    if (!stock) {
         const { error: insertStockError } = await supabaseAdmin
            .from('inventory_stock')
            .insert({
                organization_id: ORG_ID,
                item_id: itemId,
                location_id: locationId,
                quantity: quantity
            });
         if (insertStockError) throw insertStockError;
    } else {
         const { error: updateStockError } = await supabaseAdmin
            .from('inventory_stock')
            .update({ quantity: Number(stock.quantity) + Number(quantity) })
            .eq('id', stock.id);
         if (updateStockError) throw updateStockError;
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
