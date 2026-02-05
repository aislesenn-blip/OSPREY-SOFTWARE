"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define explicit types
interface LedgerAccount {
  name: string;
}

interface LedgerLine {
  id: string;
  debit: number;
  credit: number;
  ledger_accounts: LedgerAccount;
}

interface LedgerEntry {
  id: string;
  transaction_date: string;
  description: string;
  ledger_lines: LedgerLine[];
}

export default function FinancePage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      // Complex relational query
      const { data, error } = await supabase
        .from('ledger_entries')
        .select(`
          *,
          ledger_lines (
            *,
            ledger_accounts (
              name
            )
          )
        `);

      if (error) {
        console.error('Error fetching ledger:', error);
      } else if (data) {
        setEntries(data as any[]); // Casting to any for complex join result flexibility or strict type mapped
      }
      setLoading(false);
    }
    fetchLedger();
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
                entry.ledger_lines.map((line, idx) => (
                  <tr key={`${entry.id}-${line.id || idx}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {idx === 0 ? new Date(entry.transaction_date).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{line.ledger_accounts?.name || 'Unknown Account'}</div>
                      <div className="text-xs text-slate-500">{entry.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      {line.debit > 0 ? `$${Number(line.debit).toFixed(2)}` : '-'}
                    </td>
                     <td className="px-6 py-4 text-right font-mono text-slate-700">
                      {line.credit > 0 ? `$${Number(line.credit).toFixed(2)}` : '-'}
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
