"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Users, UserPlus, Search, ShieldCheck } from "lucide-react";

type RoleAssignment = {
  roles: {
    name: string;
  };
  nodes: {
    name: string;
  } | null;
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role_assignments: RoleAssignment[];
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      // Fetch profiles with their role assignments
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          role_assignments (
            roles (name),
            nodes (name)
          )
        `)
        .order("full_name", { ascending: true });

      if (error) throw error;

      setUsers((data as any) || []);
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
          <h1 className="text-2xl font-bold text-navy">Users & Roles</h1>
          <p className="text-gray-500">Manage access and permissions</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <UserPlus size={16} />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
            </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : users.length === 0 ? (
            <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                <p className="text-gray-500 mt-1">Invite your team to get started.</p>
            </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                            {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                        </div>
                        <div>
                            <div className="font-medium text-navy">{user.full_name || 'No Name'}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role_assignments && user.role_assignments.length > 0 ? (
                        user.role_assignments.map((assignment, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-1">
                                {assignment.roles?.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm italic">No Role</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {user.role_assignments && user.role_assignments.length > 0 ? (
                         user.role_assignments.map((assignment, idx) => (
                            <div key={idx}>
                                {assignment.nodes ? (
                                    <span className="flex items-center space-x-1 text-xs text-gray-500">
                                        <ShieldCheck size={12} />
                                        <span>{assignment.nodes.name}</span>
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">Global</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
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
