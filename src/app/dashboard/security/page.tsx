"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Truck, Users, Package } from 'lucide-react';

export default function SecurityGatePass() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [driverName, setDriverName] = useState('');
  const [passengerCount, setPassengerCount] = useState(0);
  const [load, setLoad] = useState('');
  const [generatedPass, setGeneratedPass] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/ops/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In real app, we'd lookup driver UUID. Here we pass null for driver_id if text is used,
      // or we just mock the ID. I'll mock a driver ID from seed if I can, or just send null.
      // The API expects UUID? schema says `driver_id uuid references profiles`.
      // I'll skip sending driver_id if I don't have a valid UUID, but the schema has FK.
      // I'll fetch the first profile if possible? Or just rely on the user picking a vehicle.
      // Actually, for this demo, I will send a valid UUID from my seed: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' is Org,
      // Profile ID is usually Auth ID.
      // I'll modify the API to accept just text for "Driver Name" if I change schema? No, schema is fixed.
      // I will use a hardcoded valid UUID for the driver for now to satisfy the FK.
      // Reference from seed: I didn't seed profiles linked to Auth explicitly with known UUIDs that match Auth.
      // Wait, seed.sql: `INSERT INTO staff (organization_id, full_name, role) ...`
      // `gate_passes` links to `profiles`. `staff` is different.
      // I should have linked `gate_passes` to `staff` maybe?
      // "Role (The Driver) ... Geneology".
      // Okay, I'll update the API to be lenient or I'll just not send driver_id and hope it's nullable.
      // Schema: `driver_id uuid references profiles(id)` - it is nullable.

      const res = await fetch('/api/v1/ops/security/gatepass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          passengerCount: Number(passengerCount),
          loadDescription: `${driverName} - ${load}` // Combine driver name into load desc for now
        })
      });

      const json = await res.json();
      if (res.ok) {
        setGeneratedPass(json.pass);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Security Gate Control</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-slate-500" />
            Issue Gate Pass
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
              <div className="relative">
                <Truck className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <select
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 pl-9 border"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate_number}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name</label>
              <input
                type="text"
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="number"
                    className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 pl-9 border"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Load Description</label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <textarea
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 pl-9 border"
                  rows={3}
                  placeholder="e.g. 2x Spare Tyres, Guest Luggage"
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Gate Pass'}
            </button>
          </form>
        </div>

        {/* PASS DISPLAY */}
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 border-dashed p-8">
          {generatedPass ? (
            <div className="bg-white p-6 shadow-lg rounded-xl text-center max-w-sm w-full border border-slate-100">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">GATE PASS</h3>
                <p className="text-xs text-slate-400 font-mono">{generatedPass.id}</p>
              </div>

              <div className="bg-white p-2 inline-block">
                <QRCodeSVG value={generatedPass.qr_code} size={200} />
              </div>

              <div className="mt-6 text-left space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-bold text-slate-900">{vehicles.find(v => v.id === selectedVehicle)?.plate_number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Passengers</span>
                  <span className="font-medium text-slate-900">{passengerCount}</span>
                </div>
                 <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="pt-2">
                   <span className="text-slate-500 block text-xs">Load</span>
                   <p className="font-medium text-slate-900 text-xs">{load}</p>
                </div>
              </div>

              <div className="mt-6 bg-emerald-50 text-emerald-800 text-xs font-bold py-2 px-4 rounded-full inline-block uppercase">
                Authorized for Exit
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <ShieldCheck size={48} className="mx-auto mb-2 opacity-50" />
              <p>Fill form to generate pass</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
