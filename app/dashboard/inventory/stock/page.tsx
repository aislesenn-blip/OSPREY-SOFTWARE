"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Package, Search, BarChart } from "lucide-react";

type StockItem = {
  item_name: string;
  sku: string;
  store_name: string;
  quantity_on_hand: number;
  estimated_unit_value: number;
};

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    setLoading(true);
    const { data } = await supabase
      .from("view_inventory_valuation")
      .select("*")
      .order("item_name", { ascending: true });

    if (data) setStock(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Stock Levels</h1>
          <p className="text-gray-500">Real-time inventory tracking across all stores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Items</h3>
            <p className="text-2xl font-bold text-navy mt-2">
                {stock.reduce((sum, s) => sum + s.quantity_on_hand, 0).toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Unique SKUs</h3>
            <p className="text-2xl font-bold text-navy mt-2">
                {new Set(stock.map(s => s.sku)).size}
            </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search stock..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
            </div>
        </div>

        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading stock...</div>
        ) : stock.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No stock found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Item Name</th>
                        <th className="px-6 py-3">SKU</th>
                        <th className="px-6 py-3">Location (Store)</th>
                        <th className="px-6 py-3 text-right">Qty on Hand</th>
                        <th className="px-6 py-3 text-right">Est. Value</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stock.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 font-medium text-navy">{item.item_name}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.sku}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                    <Package size={14} className="text-gray-400" />
                                    <span>{item.store_name}</span>
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-right font-bold">{item.quantity_on_hand.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-mono text-right text-gray-500">{item.estimated_unit_value.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                {item.quantity_on_hand <= 10 ? ( // Arbitrary reorder level visualization
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        In Stock
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
