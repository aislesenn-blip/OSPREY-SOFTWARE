"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { PackageCheck, Plus, Check } from "lucide-react";

type PurchaseOrder = {
  id: string;
  po_number: string;
  supplier: { name: string } | null;
  total_amount: number;
};

type StockItem = {
  sku: string;
  name: string;
};

export default function ReceivingPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPo, setSelectedPo] = useState('');
  const [lines, setLines] = useState([{ sku: '', qty: 0 }]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  async function fetchMetadata() {
    setLoading(true);
    const { data: posData } = await supabase
        .from("purchase_orders")
        .select("id, po_number, total_amount, supplier:suppliers(name)")
        .eq("status", "ISSUED");

    if (posData) setPos(posData as any);

    const { data: itemsData } = await supabase.from("stock_items").select("sku, name");
    if (itemsData) setItems(itemsData);

    setLoading(false);
  }

  async function handleSubmit() {
    if (!selectedPo) return alert("Select a PO");

    try {
        const payload = lines.map(l => ({ sku: l.sku, qty: l.qty }));

        const { data, error } = await supabase.rpc('process_blind_receiving', {
            po_id_val: selectedPo,
            received_items: payload
        });

        if (error) throw error;

        alert(data); // "Blind Receiving Processed. Variances logged."
        setLines([{ sku: '', qty: 0 }]);
        setSelectedPo('');
        fetchMetadata(); // Refresh PO list if needed
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  }

  function addLine() {
    setLines([...lines, { sku: '', qty: 0 }]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Blind Receiving</h1>
          <p className="text-gray-500">Process incoming deliveries securely</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-8">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order (PO)</label>
            <select
                className="w-full border p-3 rounded bg-gray-50 focus:ring-2 focus:ring-navy/20 focus:border-navy"
                value={selectedPo}
                onChange={e => setSelectedPo(e.target.value)}
            >
                <option value="">-- Choose Pending PO --</option>
                {pos.map(po => (
                    <option key={po.id} value={po.id}>
                        {po.po_number} - {po.supplier?.name} (Total: {po.total_amount})
                    </option>
                ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Only issued POs are available for receiving.</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                <PackageCheck size={18} />
                <span>Items Received</span>
            </h3>

            <div className="space-y-3">
                {lines.map((line, idx) => (
                    <div key={idx} className="flex space-x-4 items-center">
                        <div className="flex-1">
                            <select
                                className="w-full border p-2 rounded"
                                value={line.sku}
                                onChange={e => {
                                    const newLines = [...lines];
                                    newLines[idx].sku = e.target.value;
                                    setLines(newLines);
                                }}
                            >
                                <option value="">Select SKU</option>
                                {items.map(i => <option key={i.sku} value={i.sku}>{i.sku} - {i.name}</option>)}
                            </select>
                        </div>
                        <div className="w-32">
                            <input
                                type="number"
                                placeholder="Qty"
                                className="w-full border p-2 rounded text-right"
                                value={line.qty}
                                onChange={e => {
                                    const newLines = [...lines];
                                    newLines[idx].qty = parseFloat(e.target.value) || 0;
                                    setLines(newLines);
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const newLines = lines.filter((_, i) => i !== idx);
                                setLines(newLines);
                            }}
                            className="text-red-400 hover:text-red-600 font-bold px-2"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={addLine} className="mt-4 text-blue-600 text-sm font-medium flex items-center space-x-1">
                <Plus size={14} /> <span>Add Another Item</span>
            </button>
        </div>

        <div className="pt-6 border-t border-gray-100">
            <button
                onClick={handleSubmit}
                disabled={!selectedPo || lines.length === 0}
                className="w-full bg-navy text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
                <Check size={18} />
                <span>Submit Receiving Report</span>
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
                Note: Variances between ordered and received quantities will be automatically logged for audit.
            </p>
        </div>
      </div>
    </div>
  );
}
