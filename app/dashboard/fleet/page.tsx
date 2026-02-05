"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, Fuel, AlertTriangle, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  current_km: number;
  service_due_km: number;
  status: string;
  // Computed client-side
  is_overdue?: boolean;
}

export default function FleetDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFleet() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) {
        console.error('Error fetching fleet:', error);
      } else if (data) {
        const processed = data.map((v: Vehicle) => ({
          ...v,
          is_overdue: v.current_km > v.service_due_km
        }));
        setVehicles(processed);
      }
      setLoading(false);
    }

    fetchFleet();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Fleet Management</h1>
        <Link href="/dashboard/fleet/fuel" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition">
          <Fuel size={16} />
          Dispense Fuel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading Fleet...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-slate-500">No vehicles found in database.</p>
        ) : vehicles.map((vehicle) => (
          <div key={vehicle.id} className={`p-6 rounded-lg border shadow-sm bg-white ${vehicle.is_overdue || vehicle.status === 'blocked' ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${vehicle.is_overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{vehicle.plate_number}</h3>
                  <p className="text-sm text-slate-500">{vehicle.model}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                vehicle.is_overdue || vehicle.status === 'blocked'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {vehicle.is_overdue ? 'BLOCKED' : vehicle.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Odometer</span>
                  <span className="font-medium text-slate-900">{vehicle.current_km.toLocaleString()} km</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${vehicle.is_overdue ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((vehicle.current_km % 10000) / 100, 100)}%` }} // Visual approximation
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100">
                <div className="flex items-center gap-1 text-slate-600">
                   <Settings size={12} />
                   <span>Service Due</span>
                </div>
                <span className={`font-medium ${vehicle.is_overdue ? 'text-red-600' : 'text-slate-900'}`}>
                  {vehicle.service_due_km.toLocaleString()} km
                </span>
              </div>

              {vehicle.is_overdue && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  <AlertTriangle size={14} className="mt-0.5" />
                  <span>Service Limit Exceeded. Vehicle is strictly grounded.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
