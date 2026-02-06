"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Building, Trash2 } from "lucide-react";

type Location = {
  id: string;
  name: string;
  type: 'main_store' | 'camp' | 'department' | 'station';
  created_at: string;
};

export default function SettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState("branch");

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    const { data } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLocations(data as any);
    setLoading(false);
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!newLocName) return;

    // Get Org ID (Hack: Assuming user is logged in and triggers will handle it or we fetch it)
    // Actually, RLS policies require 'organization_id' to be present if NOT default.
    // However, Supabase Client usually doesn't need org_id if RLS policies use `auth.uid()` to filter.
    // BUT for INSERT, RLS checks if `new.organization_id` matches.
    // We need to fetch the user's org_id first.

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();

    if (!profile) return;

    const { error } = await supabase.from("locations").insert({
      name: newLocName,
      type: newLocType,
      organization_id: profile.organization_id
    });

    if (error) {
      alert("Error adding location: " + error.message);
    } else {
      setNewLocName("");
      fetchLocations();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Settings & Configuration</h2>
        <p className="text-muted-foreground">Manage your organization structure and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Locations</CardTitle>
            <CardDescription>Add camps, stores, and departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLocation} className="flex gap-4 mb-6 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-xs font-medium">Location Name</label>
                <Input
                  value={newLocName}
                  onChange={e => setNewLocName(e.target.value)}
                  placeholder="e.g. Downtown Branch"
                />
              </div>
              <div className="space-y-2 w-40">
                <label className="text-xs font-medium">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newLocType}
                  onChange={e => setNewLocType(e.target.value)}
                >
                  <option value="hq">HQ</option>
                  <option value="branch">Branch</option>
                  <option value="store">Store</option>
                  <option value="site">Site</option>
                  <option value="department">Department</option>
                </select>
              </div>
              <Button type="submit" className="bg-[#0A192F]">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No locations found.</TableCell>
                    </TableRow>
                  ) : (
                    locations.map(loc => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground"/> {loc.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{loc.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                             <Trash2 className="h-4 w-4"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>System Preferences</CardTitle>
             <CardDescription>Global configuration settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Base Currency</label>
                <Input value="USD ($)" disabled className="bg-gray-100"/>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Time Zone</label>
                <Input value="Africa/Dar_es_Salaam (EAT)" disabled className="bg-gray-100"/>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
