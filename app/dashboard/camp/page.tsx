"use client";

import { useEffect, useState } from 'react';
import { ShieldAlert, Wrench, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Booking {
  reference_number: string;
  start_date: string;
  end_date: string;
}

interface Room {
  name: string;
  status: string;
}

interface Guest {
  id: string;
  full_name: string;
  allergies?: string;
  bookings: Booking; // Relation
  rooms: Room; // Relation
}

export default function CampManifest() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchManifest() {
      // Get guests with their booking and room details
      const { data, error } = await supabase
        .from('guests')
        .select(`
          *,
          bookings (
            reference_number,
            start_date,
            end_date
          ),
          rooms (
            name,
            status
          )
        `);

      if (error) {
        console.error('Error fetching manifest:', error);
      } else if (data) {
        setGuests(data as any[]);
      }
      setLoading(false);
    }
    fetchManifest();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Camp Operations</h1>
          <p className="text-slate-500">Live Manifest & Rooming List</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-md border border-slate-200 text-sm font-medium">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Room</th>
              <th className="px-6 py-4 font-medium text-slate-500">Guest Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Dates</th>
              <th className="px-6 py-4 font-medium text-slate-500">Status</th>
              <th className="px-6 py-4 font-medium text-slate-500">Alerts</th>
              <th className="px-6 py-4 font-medium text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan={6} className="px-6 py-4 text-center">Loading Manifest...</td></tr>
            ) : guests.length === 0 ? (
               <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">No guests in house.</td></tr>
            ) : (
            guests.map((guest) => (
              <tr key={guest.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">{guest.rooms?.name || 'Unassigned'}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{guest.full_name}</div>
                  <div className="text-xs text-slate-500">Ref: {guest.bookings?.reference_number}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {guest.bookings ? (
                      `${new Date(guest.bookings.start_date).toLocaleDateString()} - ${new Date(guest.bookings.end_date).toLocaleDateString()}`
                    ) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {guest.rooms?.status === 'active' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Maintenance
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {guest.allergies ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                      <ShieldAlert size={16} />
                      <span className="font-bold text-xs uppercase">{guest.allergies}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-medium border border-slate-200 px-2 py-1 rounded">
                    <Wrench size={14} /> Report Issue
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
