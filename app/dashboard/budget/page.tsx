"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { PieChart, Plus, Search, AlertTriangle } from "lucide-react";

type BudgetPerformance = {
  budget_name: string;
  department: string;
  expense_head: string;
  amount_allocated: number;
  committed: number;
  spent: number;
  remaining: number;
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("view_budget_performance")
        .select("*")
        .order("budget_name", { ascending: true });

      if (error) throw error;
      setBudgets(data || []);
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
          <h1 className="text-2xl font-bold text-navy">Budget Control</h1>
          <p className="text-gray-500">Vote Book Overview and Performance</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>New Budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Allocated</h3>
            <p className="text-2xl font-bold text-navy mt-2">
                {budgets.reduce((sum, b) => sum + b.amount_allocated, 0).toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Consumed</h3>
            <p className="text-2xl font-bold text-navy mt-2">
                {budgets.reduce((sum, b) => sum + b.committed + b.spent, 0).toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Remaining Balance</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
                {budgets.reduce((sum, b) => sum + b.remaining, 0).toLocaleString()}
            </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search budgets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
            </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading budget data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : budgets.length === 0 ? (
            <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No active budgets</h3>
                <p className="text-gray-500 mt-1">Create a budget to track spending.</p>
            </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Budget / Dept</th>
                <th className="px-6 py-3">Expense Head</th>
                <th className="px-6 py-3 text-right">Allocated</th>
                <th className="px-6 py-3 text-right">Consumed</th>
                <th className="px-6 py-3 text-right">Remaining</th>
                <th className="px-6 py-3 text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map((b, idx) => {
                const percentUsed = ((b.committed + b.spent) / b.amount_allocated) * 100;
                return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                            <div className="font-medium text-navy">{b.budget_name}</div>
                            <div className="text-xs text-gray-500">{b.department}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.expense_head}</td>
                        <td className="px-6 py-4 text-sm font-mono text-right">{b.amount_allocated.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-mono text-right">{(b.committed + b.spent).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-mono text-right font-bold text-green-700">{b.remaining.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                            {percentUsed > 90 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                    <AlertTriangle size={12} className="mr-1" /> Critical
                                </span>
                            ) : percentUsed > 70 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Warning
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Healthy
                                </span>
                            )}
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
