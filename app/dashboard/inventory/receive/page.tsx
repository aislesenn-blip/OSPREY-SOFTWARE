"use client";

import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function BlindReceiving() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/v1/ops/inventory/items')
      .then(res => res.json())
      .then(data => setItems(data.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ops/inventory/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          quantity: Number(quantity),
          locationId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Assuming main store logic handled in API or default
          reference
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/inventory'), 1500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Receive Goods</h1>
        <p className="text-slate-500">Blind Receiving Mode: Enter physical count only.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Stock received successfully. Updating Ledger...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Item</label>
          <select
            className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            required
          >
            <option value="">-- Choose Item --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reference (PO / Invoice #)</label>
          <input
            type="text"
            className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
            placeholder="e.g. INV-2023-001"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Received</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="flex-1 border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <span className="text-slate-500 text-sm font-medium bg-slate-100 px-3 py-2 rounded-md">
              {items.find(i => i.id === selectedItem)?.unit || 'Unit'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
             <AlertCircle size={12} />
             Do not rely on the delivery note. Count physically.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Receipt'}
        </button>
      </form>
    </div>
  );
}
