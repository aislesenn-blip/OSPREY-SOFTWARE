"use client";

import { useEffect, useState } from 'react';

export default function FinancePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/ops/finance/ledger')
      .then(res => res.json())
      .then(data => {
        setEntries(data.data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading Ledger...</div>
        ) : entries.length === 0 ? (
           <div className="p-6 text-center text-slate-500">No transactions recorded yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-right">Debit</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                entry.ledger_lines.map((line: any, idx: number) => (
                  <tr key={`${entry.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {idx === 0 ? new Date(entry.transaction_date).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{line.ledger_accounts.name}</div>
                      <div className="text-xs text-slate-500">{entry.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                    </td>
                     <td className="px-6 py-4 text-right font-mono text-slate-700">
                      {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
