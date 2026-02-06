"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, ArrowDownToLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name", { ascending: true });

    if (data) setItems(data);
    setLoading(false);
  }

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.sku && i.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Inventory</h2>
          <p className="text-muted-foreground">Manage stock levels, items, and valuation.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory/receiving">
             <Button variant="outline"><ArrowDownToLine className="mr-2 h-4 w-4" /> Receive Stock</Button>
          </Link>
          <Button className="bg-[#0A192F] hover:bg-[#1B4D3E]">
            <Plus className="mr-2 h-4 w-4" /> New Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock List</CardTitle>
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
              <p>No inventory items found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku || '-'}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || 'General'}</TableCell>
                    <TableCell className="text-right font-bold">
                      {item.current_stock} <span className="text-muted-foreground font-normal text-xs">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost_price * item.current_stock)}</TableCell>
                    <TableCell>
                      {item.current_stock <= item.min_stock_level ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
