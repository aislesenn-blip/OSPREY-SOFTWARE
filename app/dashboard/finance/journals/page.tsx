"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { DollarSign, Plus, Check, Save } from "lucide-react";

type JournalEntry = {
  id: string;
  transaction_date: string;
  reference: string;
  narration: string;
  status: string;
  fiscal_periods: { name: string } | null;
  journal_lines: {
    id: string;
    account: { name: string; code: string };
    debit: number;
    credit: number;
    description: string;
  }[];
};

type Account = {
  id: string;
  code: string;
  name: string;
};

export default function JournalsPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    lines: [{ account_id: '', debit: 0, credit: 0, description: '' }]
  });

  useEffect(() => {
    fetchJournals();
    fetchAccounts();
  }, []);

  async function fetchJournals() {
    setLoading(true);
    const { data } = await supabase
      .from("journal_entries")
      .select(`
        *,
        fiscal_periods (name),
        journal_lines (
          id,
          debit,
          credit,
          description,
          account:chart_of_accounts (name, code)
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setJournals(data as any);
    setLoading(false);
  }

  async function fetchAccounts() {
    const { data } = await supabase.from("chart_of_accounts").select("id, code, name");
    if (data) setAccounts(data);
  }

  async function handleSaveDraft() {
    try {
        // 1. Create Entry
        const { data: entry, error: entryError } = await supabase
            .from("journal_entries")
            .insert({
                transaction_date: formData.date,
                reference: formData.reference,
                narration: formData.narration,
                status: 'DRAFT',
                // For simplicity, we assume an open fiscal period exists or is optional for now
                // In production, we'd fetch the active period ID
            })
            .select()
            .single();

        if (entryError) throw entryError;

        // 2. Create Lines
        const linesToInsert = formData.lines.map(line => ({
            journal_entry_id: entry.id,
            account_id: line.account_id,
            debit: line.debit,
            credit: line.credit,
            description: line.description || formData.narration
        }));

        const { error: linesError } = await supabase.from("journal_lines").insert(linesToInsert);
        if (linesError) throw linesError;

        alert("Draft Saved!");
        setView('list');
        fetchJournals();
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  }

  async function handlePost(id: string) {
    try {
        const { error } = await supabase.rpc('post_journal_entry', { entry_id: id });
        if (error) throw error;
        alert("Posted Successfully!");
        fetchJournals();
    } catch (err: any) {
        alert("Error Posting: " + err.message);
    }
  }

  function addLine() {
    setFormData({ ...formData, lines: [...formData.lines, { account_id: '', debit: 0, credit: 0, description: '' }] });
  }

  if (view === 'create') {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-navy">New Journal Entry</h1>
                <div className="space-x-2">
                    <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                    <button onClick={handleSaveDraft} className="bg-navy text-white px-4 py-2 rounded flex items-center space-x-2">
                        <Save size={16} /> <span>Save Draft</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Date</label>
                        <input type="date" className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Reference</label>
                        <input type="text" className="w-full border p-2 rounded" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Narration</label>
                    <input type="text" className="w-full border p-2 rounded" value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} />
                </div>

                <div className="pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Journal Lines</h3>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-2">Account</th>
                                <th className="p-2">Description</th>
                                <th className="p-2">Debit</th>
                                <th className="p-2">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lines.map((line, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">
                                        <select
                                            className="w-full border p-1 rounded"
                                            value={line.account_id}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].account_id = e.target.value;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="text" className="w-full border p-1 rounded" value={line.description}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].description = e.target.value;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-full border p-1 rounded" value={line.debit}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].debit = parseFloat(e.target.value) || 0;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-full border p-1 rounded" value={line.credit}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].credit = parseFloat(e.target.value) || 0;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addLine} className="mt-2 text-blue-600 text-sm font-medium">+ Add Line</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Journal Entries</h1>
          <p className="text-gray-500">View and post financial transactions</p>
        </div>
        <button onClick={() => setView('create')} className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>New Journal</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading journals...</div>
        ) : journals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No journals found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Reference</th>
                        <th className="px-6 py-3">Narration</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {journals.map((j) => {
                        const total = j.journal_lines.reduce((sum, line) => sum + line.debit, 0);
                        return (
                            <tr key={j.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 text-sm text-gray-600">{j.transaction_date}</td>
                                <td className="px-6 py-4 font-mono text-xs">{j.reference}</td>
                                <td className="px-6 py-4 text-sm font-medium text-navy">{j.narration}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${j.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {j.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono">{total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    {j.status === 'DRAFT' && (
                                        <button onClick={() => handlePost(j.id)} className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center space-x-1">
                                            <Check size={14} /> <span>Post</span>
                                        </button>
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
