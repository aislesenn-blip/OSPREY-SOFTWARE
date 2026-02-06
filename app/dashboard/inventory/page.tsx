"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, ArrowRightLeft, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { createItemAction, transferStockAction } from "@/lib/actions";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch Items
    const { data: itemsData } = await supabase
      .from("items")
      .select("*")
      .order("name");

    // Fetch Levels (Total Stock per item)
    // This is a bit heavy client-side but okay for typical internal tool size
    const { data: levelsData } = await supabase.from("inventory_levels").select("item_id, quantity");

    // Fetch Locations for Transfer
    const { data: locData } = await supabase.from("locations").select("*");

    if (itemsData) {
        const merged = itemsData.map(item => {
            const totalStock = levelsData
                ? levelsData.filter((l: any) => l.item_id === item.id).reduce((sum, l) => sum + Number(l.quantity), 0)
                : 0;
            return { ...item, totalStock };
        });
        setItems(merged);
    }
    if (locData) setLocations(locData);

    setLoading(false);
  }

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.sku && i.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Inventory</h2>
          <p className="text-muted-foreground">Universal stock management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTransferModal(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stock
          </Button>
          <Button className="bg-[#0A192F] hover:bg-[#1B4D3E]" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items & Stock</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-20" />
              <p>No items found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku || '-'}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right font-bold">{item.totalStock}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.selling_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-lg bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>New Inventory Item</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4"/></Button>
                  </CardHeader>
                  <CardContent>
                      <form action={async (formData) => {
                          const res = await createItemAction(formData);
                          if (res?.error) { alert(res.error); return; }
                          setShowAddModal(false);
                          fetchData();
                      }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Name</label>
                                  <Input name="name" required placeholder="e.g. Cement 50kg"/>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">SKU</label>
                                  <Input name="sku" placeholder="Optional"/>
                              </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Unit</label>
                                  <Input name="unit" required placeholder="pcs, kg"/>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Cost Price</label>
                                  <Input name="costPrice" type="number" step="0.01" required placeholder="0.00"/>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Selling Price</label>
                                  <Input name="sellingPrice" type="number" step="0.01" required placeholder="0.00"/>
                              </div>
                          </div>
                          <Button type="submit" className="w-full bg-[#0A192F]">Create Item</Button>
                      </form>
                  </CardContent>
              </Card>
          </div>
      )}

      {/* Transfer Stock Modal */}
      {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-lg bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Transfer Stock</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowTransferModal(false)}><X className="h-4 w-4"/></Button>
                  </CardHeader>
                  <CardContent>
                      <form action={async (formData) => {
                          const res = await transferStockAction(formData);
                          if (res?.error) { alert(res.error); return; }
                          setShowTransferModal(false);
                          fetchData();
                      }} className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Item</label>
                              <select name="itemId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                  <option value="">Select Item...</option>
                                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                              </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">From Location</label>
                                  <select name="fromLocation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                      <option value="">Source...</option>
                                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">To Location</label>
                                  <select name="toLocation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                      <option value="">Destination...</option>
                                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Quantity</label>
                              <Input name="quantity" type="number" required />
                          </div>
                          <Button type="submit" className="w-full bg-[#0A192F]">Transfer</Button>
                      </form>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
}
