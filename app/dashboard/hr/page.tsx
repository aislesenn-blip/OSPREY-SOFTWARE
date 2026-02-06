"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Staff } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function HRPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite State
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    // Fetch from 'profiles' or 'staff' table?
    // Schema has 'profiles' (users) and 'staff' (HR records).
    // Ideally they are linked. For now I'll fetch 'profiles' as the user list.
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setStaff(data as any); // Type cast for now
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: inviteEmail,
            fullName: inviteName,
            role: inviteRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Invitation sent successfully!");
      setShowInvite(false);
      setInviteEmail("");
      setInviteName("");
    } catch (err: any) {
      alert("Error sending invite: " + err.message);
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Staff & HR</h2>
          <p className="text-muted-foreground">Manage employees and system users.</p>
        </div>
        <Button
            className="bg-[#0A192F] hover:bg-[#1B4D3E]"
            onClick={() => setShowInvite(!showInvite)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </div>

      {showInvite && (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-300">
            <CardHeader>
                <CardTitle className="text-sm">Invite New Team Member</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleInvite} className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-xs font-medium">Full Name</label>
                        <Input
                            value={inviteName}
                            onChange={e => setInviteName(e.target.value)}
                            placeholder="Jane Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-xs font-medium">Email Address</label>
                        <Input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="jane@company.com"
                            required
                        />
                    </div>
                    <div className="space-y-2 w-40">
                        <label className="text-xs font-medium">Role</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                        >
                            <option value="staff">Staff</option>
                            <option value="driver">Driver</option>
                            <option value="mechanic">Mechanic</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <Button type="submit" disabled={inviteLoading}>
                        {inviteLoading ? "Sending..." : "Send Invite"}
                    </Button>
                </form>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p>No staff members found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
