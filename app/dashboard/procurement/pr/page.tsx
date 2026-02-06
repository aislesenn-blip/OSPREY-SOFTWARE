"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { ShoppingCart, Plus, Check, Save } from "lucide-react";

type PurchaseRequest = {
  id: string;
  requester_id: string;
  department_node_id: string;
  status: string;
  description: string;
  total_estimated_cost: number;
  needed_by: string;
  nodes: { name: string } | null;
  pr_lines: {
    id: string;
    item_description: string;
    quantity: number;
    estimated_unit_cost: number;
    total_cost: number;
    chart_of_accounts: { name: string; code: string } | null;
  }[];
};

type Node = { id: string; name: string; };
type Account = { id: string; code: string; name: string; };

export default function PurchaseRequestsPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');

  const [nodes, setNodes] = useState<Node[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    department_id: '',
    needed_by: new Date().toISOString().split('T')[0],
    description: '',
    lines: [{ item_description: '', quantity: 0, estimated_unit_cost: 0, expense_account_id: '' }]
  });

  useEffect(() => {
    fetchPrs();
    fetchMetadata();
  }, []);

  async function fetchPrs() {
    setLoading(true);
    const { data } = await supabase
      .from("purchase_requests")
      .select(`
        *,
        nodes (name),
        pr_lines (
          *,
          chart_of_accounts (name, code)
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setPrs(data as any);
    setLoading(false);
  }

  async function fetchMetadata() {
    const { data: nodesData } = await supabase.from("nodes").select("id, name");
    if (nodesData) setNodes(nodesData);

    const { data: accountsData } = await supabase.from("chart_of_accounts").select("id, code, name").eq("type", "EXPENSE");
    if (accountsData) setAccounts(accountsData);
  }

  async function handleSubmit() {
    try {
        // 1. Create PR Header
        const { data: pr, error: prError } = await supabase
            .from("purchase_requests")
            .insert({
                department_node_id: formData.department_id,
                needed_by: formData.needed_by,
                description: formData.description,
                status: 'PENDING_APPROVAL' // Submit for approval immediately
            })
            .select()
            .single();

        if (prError) throw prError;

        // 2. Create PR Lines
        const linesToInsert = formData.lines.map(line => ({
            pr_id: pr.id,
            item_description: line.item_description,
            quantity: line.quantity,
            estimated_unit_cost: line.estimated_unit_cost,
            expense_account_id: line.expense_account_id
        }));

        const { error: linesError } = await supabase.from("pr_lines").insert(linesToInsert);
        if (linesError) throw linesError;

        alert("PR Submitted for Approval!");
        setView('list');
        fetchPrs();
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  }

  function addLine() {
    setFormData({ ...formData, lines: [...formData.lines, { item_description: '', quantity: 0, estimated_unit_cost: 0, expense_account_id: '' }] });
  }

  if (view === 'create') {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-navy">New Purchase Request</h1>
                <div className="space-x-2">
                    <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                    <button onClick={handleSubmit} className="bg-navy text-white px-4 py-2 rounded flex items-center space-x-2">
                        <Check size={16} /> <span>Submit Request</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Department</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={formData.department_id}
                            onChange={e => setFormData({...formData, department_id: e.target.value})}
                        >
                            <option value="">Select Department</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Needed By</label>
                        <input type="date" className="w-full border p-2 rounded" value={formData.needed_by} onChange={e => setFormData({...formData, needed_by: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Description / Justification</label>
                    <textarea className="w-full border p-2 rounded" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Items Required</h3>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-2">Item Description</th>
                                <th className="p-2 w-24">Quantity</th>
                                <th className="p-2 w-32">Est. Cost</th>
                                <th className="p-2 w-64">Expense Account</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lines.map((line, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">
                                        <input type="text" className="w-full border p-1 rounded" value={line.item_description}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].item_description = e.target.value;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-full border p-1 rounded" value={line.quantity}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].quantity = parseFloat(e.target.value) || 0;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-full border p-1 rounded" value={line.estimated_unit_cost}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].estimated_unit_cost = parseFloat(e.target.value) || 0;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="w-full border p-1 rounded"
                                            value={line.expense_account_id}
                                            onChange={e => {
                                                const newLines = [...formData.lines];
                                                newLines[idx].expense_account_id = e.target.value;
                                                setFormData({...formData, lines: newLines});
                                            }}
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addLine} className="mt-2 text-blue-600 text-sm font-medium">+ Add Item</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Purchase Requests</h1>
          <p className="text-gray-500">Manage procurement needs</p>
        </div>
        <button onClick={() => setView('create')} className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : prs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No requests found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Needed By</th>
                        <th className="px-6 py-3">Department</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Est. Total</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {prs.map((pr) => {
                        // Calculate total manually since view might not be updated instantly or triggers might delay
                        // Actually pr_lines has generated column, but we fetch it.
                        const total = pr.pr_lines.reduce((sum, line) => sum + (line.quantity * line.estimated_unit_cost), 0);
                        return (
                            <tr key={pr.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(pr.needed_by).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-navy">{pr.nodes?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{pr.description}</td>
                                <td className="px-6 py-4 text-sm font-mono">{total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${pr.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                          pr.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {pr.status}
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
