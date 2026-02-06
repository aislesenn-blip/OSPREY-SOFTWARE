"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Network, Plus, Search } from "lucide-react";

type Node = {
  id: string;
  name: string;
  type_id: string;
  parent_id: string | null;
  node_types: {
    name: string;
  } | null;
  parent: {
    name: string;
  } | null;
  created_at: string;
};

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNodes();
  }, []);

  async function fetchNodes() {
    try {
      setLoading(true);
      // Fetch nodes with their type names and parent names
      // Note: 'parent:nodes(name)' is the syntax for self-join if relationship is clear,
      // but Supabase/PostgREST might need explicit foreign key hint if ambiguous.
      // Let's try standard recursive join syntax or just fetch all and map in JS for safety if simple join fails.
      // For now, let's assume standard joins work.

      const { data, error } = await supabase
        .from("nodes")
        .select(`
          *,
          node_types (name),
          parent:parent_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Cast the result to the expected type safely
      setNodes((data as any) || []);
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
          <h1 className="text-2xl font-bold text-navy">Organization Nodes</h1>
          <p className="text-gray-500">Manage departments, branches, and sites</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>Add Node</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search nodes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
            </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading hierarchy...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : nodes.length === 0 ? (
            <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Network className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No nodes found</h3>
                <p className="text-gray-500 mt-1">Get started by creating your first organization node.</p>
            </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Node Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Parent Node</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-navy">{node.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {node.node_types?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {node.parent?.name ? (
                        <span className="flex items-center space-x-1">
                            <Network size={14} className="text-gray-400" />
                            <span>{node.parent.name}</span>
                        </span>
                    ) : (
                        <span className="text-gray-400 italic">Root</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(node.created_at).toLocaleDateString()}
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
