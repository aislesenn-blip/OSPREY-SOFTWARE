"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Play, FileText, CheckCircle, Clock } from "lucide-react";

type PayrollRun = {
  id: string;
  name: string;
  status: string;
  run_date: string;
  fiscal_periods: {
    name: string;
  } | null;
};

type FiscalPeriod = {
  id: string;
  name: string;
};

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [formData, setFormData] = useState({
    name: '',
    period_id: ''
  });

  useEffect(() => {
    fetchRuns();
    fetchPeriods();
  }, []);

  async function fetchRuns() {
    setLoading(true);
    const { data } = await supabase
      .from("payroll_runs")
      .select(`
        *,
        fiscal_periods (name)
      `)
      .order("created_at", { ascending: false });

    if (data) setRuns(data as any);
    setLoading(false);
  }

  async function fetchPeriods() {
    const { data } = await supabase.from("fiscal_periods").select("id, name").eq("is_closed", false);
    if (data) setPeriods(data);
  }

  async function handleRunPayroll() {
    try {
        setLoading(true);
        // 1. Create Run Record
        const { data: run, error: runError } = await supabase
            .from("payroll_runs")
            .insert({
                name: formData.name,
                fiscal_period_id: formData.period_id,
                status: 'PROCESSING'
            })
            .select()
            .single();

        if (runError) throw runError;

        // 2. Trigger Calculation Engine (Aruti Logic)
        const { error: calcError } = await supabase.rpc('calculate_payroll_run', { run_id: run.id });
        if (calcError) throw calcError;

        // 3. Mark as Draft/Review (Engine usually sets it, but we can update here if needed)
        await supabase.from("payroll_runs").update({ status: 'DRAFT' }).eq("id", run.id);

        alert("Payroll Calculated Successfully!");
        setView('list');
        fetchRuns();
    } catch (err: any) {
        alert("Error: " + err.message);
    } finally {
        setLoading(false);
    }
  }

  if (view === 'create') {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-navy">Run Payroll</h1>
                <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
            </div>

            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Name</label>
                    <input
                        type="text"
                        placeholder="e.g. January 2024 Salary"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Period</label>
                    <select
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        value={formData.period_id}
                        onChange={e => setFormData({...formData, period_id: e.target.value})}
                    >
                        <option value="">Select Period</option>
                        {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleRunPayroll}
                        disabled={loading || !formData.name || !formData.period_id}
                        className="w-full bg-navy text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <Play size={18} />
                                <span>Calculate Payroll</span>
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        This will execute formula engine for all active employees.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payroll Management</h1>
          <p className="text-gray-500">Process salaries and generate payslips</p>
        </div>
        <button onClick={() => setView('create')} className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Play size={16} />
          <span>Process Payroll</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading runs...</div>
        ) : runs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No payroll runs found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Run Name</th>
                        <th className="px-6 py-3">Period</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {runs.map((run) => (
                        <tr key={run.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 font-medium text-navy">{run.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{run.fiscal_periods?.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(run.run_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${run.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                      run.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'}`}>
                                    {run.status === 'PROCESSING' ? <Clock size={12} className="mr-1 animate-spin" /> : null}
                                    {run.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-navy hover:text-blue-600 font-medium text-xs flex items-center space-x-1">
                                    <FileText size={14} /> <span>Payslips</span>
                                </button>
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
