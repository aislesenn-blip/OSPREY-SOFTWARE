"use client";

import { useEffect, useState } from 'react';
import { Users, Utensils, UserPlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Define explicit types
interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  organization_id: string;
}

export default function HRPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('driver');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data: { user } } = await supabase.auth.getUser();

    // Get user profile to know org_id
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
      if (profile) setOrgId(profile.organization_id);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching staff:', error);
    } else if (data) {
      setStaff(data as any[]);
    }
    setLoading(false);
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setInviteLoading(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
          organization_id: orgId
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Success
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      alert('Invitation sent successfully!');
      fetchStaff(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // Compute stats dynamically
  const activeStaffCount = staff.length; // Simplified for profiles
  const rationCount = activeStaffCount * 3;
  const unitCost = 4.50;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">HR & Staff Rota</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition"
        >
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RATION CARD */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Today&apos;s Rations Required</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{rationCount}</span>
              <span className="text-sm text-slate-500">Meals</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on Active Staff Count ({activeStaffCount})</p>
          </div>
          <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Utensils size={24} />
          </div>
        </div>

         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Estimated Daily Cost</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">${(rationCount * unitCost).toFixed(2)}</span>
            </div>
             <p className="text-xs text-slate-400 mt-2">@ ${unitCost.toFixed(2)} / meal</p>
          </div>
           <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Role</th>
              <th className="px-6 py-4 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={3} className="px-6 py-4 text-center">Loading Staff...</td></tr>
            ) : staff.length === 0 ? (
               <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500">No staff found.</td></tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">{s.full_name}</td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{s.role}</td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add New Staff</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="driver">Driver</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="camp_manager">Camp Manager</option>
                  <option value="storekeeper">Storekeeper</option>
                  <option value="accountant">Accountant</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50"
                >
                  {inviteLoading ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
