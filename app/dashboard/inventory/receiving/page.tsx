"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReceivingPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]); // simplified type
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form State
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: iData } = await supabase.from("inventory_items").select("*");
    if (iData) setItems(iData);

    const { data: wData } = await supabase.from("locations").select("*").in('type', ['main_store', 'camp', 'department']);
    if (wData) setWarehouses(wData);

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    setLoading(true);

    // 1. Create Transaction
    const { error: txError } = await supabase.from("inventory_transactions").insert({
      item_id: selectedItem,
      warehouse_id: selectedWarehouse || null, // Optional if no warehouse selected (main store default)
      type: "in",
      quantity: Number(quantity),
      unit_cost: Number(cost),
      reference: reference
    });

    if (txError) {
      alert("Error processing transaction");
      setLoading(false);
      return;
    }

    // 2. Update Item Stock (Triggers could do this, but logic is safer in app for specific rules sometimes.
    // ideally a DB function 'process_inventory_tx' handles this atomically.
    // For now, I will just insert the transaction and assume a trigger or subsequent update handles the aggregate.
    // Wait, the schema I wrote doesn't have a trigger to update 'current_stock' on 'inventory_items'.
    // I should probably do it manually here for the prototype.)

    // Fetch current stock
    const item = items.find(i => i.id === selectedItem);
    if (item) {
        await supabase.from("inventory_items").update({
            current_stock: Number(item.current_stock) + Number(quantity),
            // Update cost price (moving average or last cost - keeping simple: last cost)
            cost_price: Number(cost) || item.cost_price
        }).eq("id", selectedItem);
    }

    setLoading(false);
    router.push("/dashboard/inventory");
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Receive Stock</h2>
          <p className="text-muted-foreground">Process incoming inventory (Blind Receiving).</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receiving Details</CardTitle>
          <CardDescription>Enter the items physically received.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse / Branch</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Reference (Invoice/PO)</label>
                    <Input
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                        placeholder="e.g. INV-2024-001"
                    />
                 </div>
            </div>

            <div className="border-t pt-4 mt-4">
                <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Item</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedItem}
                            onChange={e => setSelectedItem(e.target.value)}
                            required
                        >
                            <option value="">Select Item...</option>
                            {items.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity Received</label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unit Cost</label>
                            <Input
                                type="number"
                                value={cost}
                                onChange={e => setCost(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full bg-[#0A192F]" disabled={loading}>
              {loading ? "Processing..." : "Confirm Receipt"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
