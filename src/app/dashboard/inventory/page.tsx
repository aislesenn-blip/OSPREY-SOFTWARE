"use client";

import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/v1/ops/inventory/items');
        const json = await res.json();
        if (json.data) {
          setItems(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Command</h1>
        <Link href="/dashboard/inventory/receive" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition">
          <Plus size={16} />
          Receive Goods
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Item Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Category</th>
              <th className="px-6 py-4 font-medium text-slate-500">Unit</th>
              <th className="px-6 py-4 font-medium text-slate-500">Min Stock</th>
              <th className="px-6 py-4 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={5} className="px-6 py-4 text-center">Loading Inventory...</td></tr>
            ) : items.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">No items found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <Package size={16} className="text-slate-400" />
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{item.category}</td>
                  <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                  <td className="px-6 py-4 text-slate-600">{item.minimum_stock}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      In Stock
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
