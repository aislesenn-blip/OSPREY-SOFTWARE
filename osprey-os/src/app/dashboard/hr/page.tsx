"use client";

import { useEffect, useState } from 'react';
import { Users, Utensils } from 'lucide-react';

export default function HRPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [rationCount, setRationCount] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

  useEffect(() => {
    fetch('/api/v1/ops/hr/staff')
      .then(res => res.json())
      .then(data => {
        setStaff(data.data || []);
        setRationCount(data.meta?.ration_count || 0);
        setUnitCost(data.meta?.ration_unit_cost || 0);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">HR & Staff Rota</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RATION CARD */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Today&apos;s Rations Required</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{rationCount}</span>
              <span className="text-sm text-slate-500">Meals</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on Active Rota Count</p>
          </div>
          <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Utensils size={24} />
          </div>
        </div>

         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Estimated Daily Cost</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">${(rationCount * unitCost).toFixed(2)}</span>
            </div>
             <p className="text-xs text-slate-400 mt-2">@ ${unitCost.toFixed(2)} / meal</p>
          </div>
           <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Role</th>
              <th className="px-6 py-4 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium text-slate-900">{s.full_name}</td>
                <td className="px-6 py-4 text-slate-600">{s.role}</td>
                <td className="px-6 py-4">
                  {s.is_active ? (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
