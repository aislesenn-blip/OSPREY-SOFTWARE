"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, Package, AlertTriangle, Building, Activity } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    employees: 0,
    items: 0,
    assets: 0,
    alerts: 0
  });
  const [labels, setLabels] = useState({
    location: "Branch",
    inventory: "Item",
    asset: "Asset"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get Org Config
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    if (profile) {
       const { data: org } = await supabase.from('organizations').select('config, industry_type').eq('id', profile.organization_id).single();
       if (org && org.config && org.config.labels) {
          setLabels(org.config.labels);
       } else if (org?.industry_type) {
           // Fallback if config not set but industry is
           setLabels(getFallbackLabels(org.industry_type));
       }

       // 2. Fetch Stats
       const { count: empCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id);
       const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id);
       const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id);

       setStats({
           employees: empCount || 0,
           items: itemCount || 0,
           assets: assetCount || 0,
           alerts: 0 // Placeholder
       });
    }
    setLoading(false);
  }

  function getFallbackLabels(industry: string) {
     switch (industry) {
        case 'Construction': return { location: 'Site', inventory: 'Material', asset: 'Machine' };
        case 'Retail': return { location: 'Branch', inventory: 'Stock', asset: 'Fixture' };
        case 'Logistics': return { location: 'Hub', inventory: 'Package', asset: 'Vehicle' };
        case 'Tourism': return { location: 'Camp', inventory: 'Item', asset: 'Vehicle' };
        default: return { location: 'Location', inventory: 'Item', asset: 'Asset' };
     }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your {labels.location} operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {labels.asset}s</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assets}</div>
            <p className="text-xs text-muted-foreground">Active units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{labels.inventory} Levels</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.items}</div>
            <p className="text-xs text-muted-foreground">Total SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alerts}</div>
            <p className="text-xs text-muted-foreground">Pending actions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No recent activity found.
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Operational Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              System nominal.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
