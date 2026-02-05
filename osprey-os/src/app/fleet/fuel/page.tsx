"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fuel, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FuelDispense() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [tripId, setTripId] = useState('');
  const [liters, setLiters] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetch('/api/v1/ops/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/ops/fleet/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          tripId,
          liters: Number(liters),
          odometer: Number(odometer),
          cost: Number(cost)
        })
      });

      const json = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Fuel dispensed and logged successfully.' });
        setTimeout(() => router.push('/fleet'), 2000);
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to dispense fuel.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Dispense Fuel</h1>
        <p className="text-slate-500">Trip-Based Fuel Issuance System</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Vehicle</label>
          <select
            className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
          >
            <option value="">-- Choose Vehicle --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id} disabled={v.is_overdue}>
                {v.plate_number} {v.is_overdue ? '(BLOCKED)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Trip ID</label>
          <input
            type="text"
            className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
            placeholder="UUID of the Trip"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Fuel is strictly linked to an active Trip.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Liters</label>
            <input
              type="number"
              className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
              placeholder="0.0"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Odometer</label>
            <input
              type="number"
              className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 border"
              placeholder="km"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-500">$</span>
            <input
              type="number"
              className="w-full border-slate-300 rounded-md shadow-sm focus:border-slate-500 focus:ring-slate-500 p-2 pl-7 border"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Validating & Dispensing...' : 'Dispense Fuel'}
        </button>
      </form>
    </div>
  );
}
