"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Monitor, Plus, CheckCircle, AlertTriangle } from "lucide-react";

type Asset = {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  status: string;
  assignments: {
    assigned_to_employee_id: string;
    employee: {
        first_name: string;
        last_name: string;
    };
  }[];
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    // Check if relationships are correct in query
    // assignments:asset_assignments ( ... )
    const { data } = await supabase
      .from("assets")
      .select(`
        *,
        assignments:asset_assignments (
            assigned_to_employee_id,
            employee:employees (first_name, last_name)
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setAssets(data as any);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Asset Management</h1>
          <p className="text-gray-500">Track lifecycle, depreciation, and assignments</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>New Asset</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading assets...</div>
        ) : assets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No assets found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Asset Tag</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-right">Cost</th>
                        <th className="px-6 py-3 text-right">Value</th>
                        <th className="px-6 py-3">Assigned To</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {assets.map((asset) => {
                        const assignee = asset.assignments?.[0]?.employee;
                        return (
                            <tr key={asset.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">{asset.asset_tag}</td>
                                <td className="px-6 py-4 font-medium text-navy">{asset.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{asset.category}</td>
                                <td className="px-6 py-4 text-sm font-mono text-right">{asset.purchase_cost?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-mono text-right">{asset.current_value?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {assignee ? (
                                        <span className="flex items-center space-x-1">
                                            <Monitor size={14} className="text-gray-400" />
                                            <span>{assignee.first_name} {assignee.last_name}</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                          asset.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'}`}>
                                        {asset.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
