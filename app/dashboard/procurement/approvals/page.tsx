"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type PurchaseRequest = {
  id: string;
  department_node_id: string;
  status: string;
  description: string;
  needed_by: string;
  nodes: { name: string } | null;
  pr_lines: {
    id: string;
    item_description: string;
    quantity: number;
    estimated_unit_cost: number;
    chart_of_accounts: { name: string; code: string } | null;
  }[];
};

export default function ApprovalsPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPrs();
  }, []);

  async function fetchPendingPrs() {
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
      .eq("status", "PENDING_APPROVAL")
      .order("created_at", { ascending: true });

    if (data) setPrs(data as any);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    if (!confirm("Are you sure you want to approve this request? Funds will be committed.")) return;

    try {
        const { error } = await supabase
            .from("purchase_requests")
            .update({ status: 'APPROVED' })
            .eq("id", id);

        if (error) throw error;

        alert("Request Approved Successfully!");
        fetchPendingPrs();
    } catch (err: any) {
        // The Trigger Exception message usually comes in 'details' or 'message'
        alert("Approval Failed: " + err.message + (err.details ? "\n" + err.details : ""));
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this request?")) return;

    await supabase.from("purchase_requests").update({ status: 'REJECTED' }).eq("id", id);
    fetchPendingPrs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pending Approvals</h1>
          <p className="text-gray-500">Review and authorize procurement requests</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading pending requests...</div>
        ) : prs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No pending approvals.</div>
        ) : (
            <div className="divide-y divide-gray-100">
                {prs.map((pr) => {
                    const total = pr.pr_lines.reduce((sum, line) => sum + (line.quantity * line.estimated_unit_cost), 0);
                    return (
                        <div key={pr.id} className="p-6 hover:bg-gray-50/50 transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{pr.nodes?.name} Department</span>
                                    <h3 className="text-lg font-medium text-navy mt-1">{pr.description}</h3>
                                    <p className="text-sm text-gray-500">Needed by: {new Date(pr.needed_by).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-navy">{total.toLocaleString()}</div>
                                    <span className="text-xs text-gray-400">Total Est. Cost</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded p-4 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-left border-b border-gray-200">
                                            <th className="pb-2">Item</th>
                                            <th className="pb-2 text-right">Qty</th>
                                            <th className="pb-2 text-right">Unit Cost</th>
                                            <th className="pb-2 text-right">Line Total</th>
                                            <th className="pb-2 pl-4">Budget Head</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pr.pr_lines.map(line => (
                                            <tr key={line.id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-2">{line.item_description}</td>
                                                <td className="py-2 text-right">{line.quantity}</td>
                                                <td className="py-2 text-right">{line.estimated_unit_cost.toLocaleString()}</td>
                                                <td className="py-2 text-right font-medium">{(line.quantity * line.estimated_unit_cost).toLocaleString()}</td>
                                                <td className="py-2 pl-4 text-gray-600 text-xs">
                                                    {line.chart_of_accounts?.name} ({line.chart_of_accounts?.code})
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => handleReject(pr.id)}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition flex items-center space-x-2"
                                >
                                    <XCircle size={16} /> <span>Reject</span>
                                </button>
                                <button
                                    onClick={() => handleApprove(pr.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center space-x-2 shadow-sm"
                                >
                                    <CheckCircle size={16} /> <span>Approve & Commit Funds</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
