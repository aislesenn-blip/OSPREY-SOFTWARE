"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { BarChart, Activity, FileText, ArrowRight } from "lucide-react";

type FinancialSummary = {
  account_type: string;
  account_code: string;
  account_name: string;
  total_debit: number;
  total_credit: number;
  net_movement: number;
};

type AuditLog = {
  id: string;
  action_type: string;
  table_name: string;
  created_at: string;
  user_id: string; // Ideally fetch profile name
  metadata: any;
};

export default function ReportsPage() {
  const [financials, setFinancials] = useState<FinancialSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    // 1. Financial Summary
    const { data: finData } = await supabase.from("view_financial_summary").select("*");
    if (finData) setFinancials(finData as any);

    // 2. Audit Logs
    const { data: logsData } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
    if (logsData) setAuditLogs(logsData);

    setLoading(false);
  }

  // Calculate totals
  const totalIncome = financials.filter(f => f.account_type === 'REVENUE').reduce((sum, f) => sum + (f.total_credit - f.total_debit), 0);
  const totalExpense = financials.filter(f => f.account_type === 'EXPENSE').reduce((sum, f) => sum + (f.total_debit - f.total_credit), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Executive Reports</h1>
          <p className="text-gray-500">System-wide performance and audit trails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Revenue</h3>
            <p className="text-2xl font-bold text-navy mt-2">
                {totalIncome.toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
                {totalExpense.toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Net Result</h3>
            <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit.toLocaleString()}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-navy flex items-center space-x-2">
                    <BarChart size={18} /> <span>Financial Breakdown</span>
                </h3>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="text-center text-gray-400">Loading financials...</div>
                ) : financials.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No posted transactions.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-2">Account</th>
                                <th className="p-2">Type</th>
                                <th className="p-2 text-right">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financials.map((f, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-2">
                                        <div className="font-medium text-navy">{f.account_name}</div>
                                        <div className="text-xs text-gray-500">{f.account_code}</div>
                                    </td>
                                    <td className="p-2 text-xs text-gray-600">{f.account_type}</td>
                                    <td className={`p-2 text-right font-mono font-medium ${f.net_movement < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {f.net_movement.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-navy flex items-center space-x-2">
                    <Activity size={18} /> <span>Recent System Activity</span>
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading logs...</div>
                ) : auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No activity recorded.</div>
                ) : (
                    auditLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex justify-between">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                                    ${log.action_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                                      log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'}`}>
                                    {log.action_type}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 text-sm text-navy">
                                <span className="font-semibold">{log.table_name}</span> - Record ID: {log.id.substring(0, 8)}...
                            </div>
                            <div className="mt-1 text-xs text-gray-500 font-mono truncate">
                                {JSON.stringify(log.metadata)}
                            </div>
                        </div>
                    ))
                )}
            </div>
             <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button className="text-navy text-sm font-medium hover:underline">View Full Audit Trail</button>
            </div>
        </div>
      </div>
    </div>
  );
}
