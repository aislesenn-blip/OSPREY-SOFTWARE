"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { DollarSign, Plus, Search } from "lucide-react";

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("code", { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Chart of Accounts</h1>
          <p className="text-gray-500">Manage financial accounts and structure</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>Add Account</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search accounts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
            </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading accounts...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No accounts found</h3>
                <p className="text-gray-500 mt-1">Initialize your chart of accounts.</p>
            </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Account Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{acc.code}</td>
                  <td className="px-6 py-4 font-medium text-navy">{acc.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${acc.type === 'ASSET' ? 'bg-green-100 text-green-800' :
                          acc.type === 'LIABILITY' ? 'bg-red-100 text-red-800' :
                          acc.type === 'EQUITY' ? 'bg-blue-100 text-blue-800' :
                          acc.type === 'REVENUE' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {acc.is_active ? (
                        <span className="text-green-600 text-xs font-medium">Active</span>
                    ) : (
                        <span className="text-gray-400 text-xs font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-navy hover:text-blue-600 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
