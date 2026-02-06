"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { QrCode, Plus, ScanLine, ArrowRight } from "lucide-react";

type GatePass = {
  id: string;
  pass_number: string;
  visitor_name: string;
  purpose: string;
  status: string;
  qr_token: string;
  valid_to: string;
};

export default function GatePassPage() {
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'scan'>('list');
  const [loading, setLoading] = useState(true);

  // Create Form
  const [formData, setFormData] = useState({
    visitor_name: '',
    purpose: '',
    items_carrying: '',
    valid_to: new Date(Date.now() + 86400000).toISOString().slice(0, 16) // Default tomorrow
  });

  // Scan Form
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'list') fetchPasses();
  }, [view]);

  async function fetchPasses() {
    setLoading(true);
    const { data } = await supabase
      .from("gate_passes")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPasses(data);
    setLoading(false);
  }

  async function handleCreate() {
    try {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { error } = await supabase.from("gate_passes").insert({
            visitor_name: formData.visitor_name,
            purpose: formData.purpose,
            items_carrying: formData.items_carrying,
            valid_from: new Date().toISOString(),
            valid_to: new Date(formData.valid_to).toISOString(),
            status: 'ACTIVE',
            pass_number: 'GP-' + Math.floor(Math.random() * 10000), // Simple ID generation
            qr_token: token
        });

        if (error) throw error;
        alert("Gate Pass Created!");
        setView('list');
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  }

  async function handleScan(type: 'ENTRY' | 'EXIT') {
    if (!scanToken) return;

    try {
        // 1. Find Pass
        const { data: pass, error: findError } = await supabase
            .from("gate_passes")
            .select("id, status, visitor_name")
            .eq("qr_token", scanToken)
            .single();

        if (findError || !pass) throw new Error("Invalid QR Token");
        if (pass.status !== 'ACTIVE' && pass.status !== 'APPROVED') throw new Error("Pass is not active");

        // 2. Log Scan
        const { error: logError } = await supabase.from("gate_logs").insert({
            gate_pass_id: pass.id,
            scan_type: type,
            notes: `Scanned at Gate A`
        });

        if (logError) throw logError;

        setScanResult(`Success: ${type} logged for ${pass.visitor_name}`);
        setScanToken('');
    } catch (err: any) {
        setScanResult(`Error: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Gate Pass System</h1>
          <p className="text-gray-500">Manage visitor access and security</p>
        </div>
        <div className="space-x-2">
            <button onClick={() => setView('scan')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition">
                <ScanLine size={16} className="inline mr-2" /> Scan QR
            </button>
            <button onClick={() => setView('create')} className="bg-navy text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition">
                <Plus size={16} className="inline mr-2" /> New Pass
            </button>
        </div>
      </div>

      {view === 'create' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-navy mb-4">Create Visitor Pass</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.visitor_name} onChange={e => setFormData({...formData, visitor_name: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items Carrying</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.items_carrying} onChange={e => setFormData({...formData, items_carrying: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input type="datetime-local" className="w-full border p-2 rounded" value={formData.valid_to} onChange={e => setFormData({...formData, valid_to: e.target.value})} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button onClick={() => setView('list')} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleCreate} className="bg-navy text-white px-4 py-2 rounded">Generate Pass</button>
            </div>
        </div>
      )}

      {view === 'scan' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6 text-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} className="text-gray-500" />
            </div>
            <h2 className="text-lg font-bold text-navy">Guard Scanner Mode</h2>
            <p className="text-sm text-gray-500">Scan visitor QR code to log entry/exit.</p>

            <input
                type="text"
                placeholder="Scan or Enter Token..."
                className="w-full border p-4 rounded text-center text-lg font-mono tracking-widest"
                value={scanToken}
                onChange={e => setScanToken(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleScan('ENTRY')} className="bg-green-600 text-white py-3 rounded hover:bg-green-700">Log Entry</button>
                <button onClick={() => handleScan('EXIT')} className="bg-red-600 text-white py-3 rounded hover:bg-red-700">Log Exit</button>
            </div>

            {scanResult && (
                <div className={`p-4 rounded text-sm font-medium ${scanResult.startsWith('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {scanResult}
                </div>
            )}
             <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:underline">Back to List</button>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
             {loading ? (
                <div className="p-8 text-center text-gray-500">Loading passes...</div>
            ) : passes.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No active passes.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {passes.map(pass => (
                        <div key={pass.id} className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-navy text-lg">{pass.visitor_name}</div>
                                    <div className="text-xs text-gray-500">{pass.pass_number}</div>
                                </div>
                                <QrCode size={24} className="text-gray-400" />
                            </div>
                            <div className="mt-4 space-y-1 text-sm text-gray-600">
                                <p><span className="font-semibold">Purpose:</span> {pass.purpose}</p>
                                <p><span className="font-semibold">Valid Until:</span> {new Date(pass.valid_to).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Token:</span> <span className="font-mono text-xs bg-gray-200 px-1 rounded">{pass.qr_token}</span></p>
                            </div>
                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${pass.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {pass.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}
