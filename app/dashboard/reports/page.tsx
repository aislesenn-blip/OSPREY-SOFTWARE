"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";

export default function ReportsPage() {
  const [metrics, setMetrics] = useState({
    totalInventoryValue: 0,
    totalPotentialProfit: 0, // Selling Price - Cost Price
    monthlyConsumption: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    // 1. Inventory Value (Cost * Stock)
    const { data: items } = await supabase.from("inventory_items").select("cost_price, selling_price, current_stock");

    let totalVal = 0;
    let totalProfitPotential = 0;

    if (items) {
      items.forEach(i => {
         const stock = Number(i.current_stock);
         const cost = Number(i.cost_price);
         const sell = Number(i.selling_price);

         totalVal += (stock * cost);
         if (sell > 0) {
            totalProfitPotential += (stock * (sell - cost));
         }
      });
    }

    setMetrics({
        totalInventoryValue: totalVal,
        totalPotentialProfit: totalProfitPotential,
        monthlyConsumption: 0 // Would need complex query on transactions
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Financial Reports</h2>
        <p className="text-muted-foreground">Real-time analysis of profit, stock value, and consumption.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalInventoryValue)}</div>
              <p className="text-xs text-muted-foreground">At cost price</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Gross Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPotentialProfit)}</div>
              <p className="text-xs text-muted-foreground">Based on current stock selling price</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumption (MTD)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
           </CardContent>
        </Card>
      </div>

      <Card className="min-h-[400px] flex items-center justify-center bg-slate-50 border-dashed">
          <div className="text-center text-muted-foreground">
             <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20"/>
             <h3 className="text-lg font-medium">Advanced Reporting Engine</h3>
             <p>Detailed charts and drill-downs will appear here.</p>
          </div>
      </Card>
    </div>
  );
}
