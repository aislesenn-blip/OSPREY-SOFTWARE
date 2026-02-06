"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trip } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OperationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    // Fetch active trips with vehicle info
    const { data } = await supabase
      .from("trips")
      .select("*, vehicle:vehicles(registration_number, model)")
      .in("status", ["active", "planned"])
      .order("start_time", { ascending: true });

    if (data) setTrips(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Operations Center</h2>
        <p className="text-muted-foreground">Live view of trips and guest movements.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {/* Live Map Placeholder */}
         <Card className="col-span-full lg:col-span-2 bg-slate-100 min-h-[300px] flex items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20"/>
                <p>Live Fleet Map Integration</p>
                <p className="text-xs">(Requires GPS Integration)</p>
            </div>
         </Card>
         <Card className="col-span-full lg:col-span-1">
             <CardHeader>
                 <CardTitle>Daily Manifest</CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                         <span>Arrivals</span>
                         <Badge variant="secondary">0</Badge>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span>Departures</span>
                         <Badge variant="secondary">0</Badge>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span>In Camp</span>
                         <Badge variant="secondary">0</Badge>
                     </div>
                 </div>
             </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div>Loading...</div>
          ) : trips.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">No active trips.</div>
          ) : (
             <div className="space-y-4">
                 {trips.map(trip => (
                     <div key={trip.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                         <div className="flex items-start gap-4">
                             <div className="bg-blue-50 p-2 rounded-full">
                                 <CalendarDays className="h-5 w-5 text-blue-600"/>
                             </div>
                             <div>
                                 <p className="font-medium">{trip.purpose}</p>
                                 <p className="text-sm text-muted-foreground">
                                     {trip.vehicle?.model} ({trip.vehicle?.registration_number})
                                 </p>
                             </div>
                         </div>
                         <div className="text-right">
                             <Badge variant={trip.status === 'active' ? 'success' : 'secondary'}>
                                 {trip.status.toUpperCase()}
                             </Badge>
                             <p className="text-xs text-muted-foreground mt-1">
                                 {trip.start_time ? formatDate(trip.start_time) : 'TBD'}
                             </p>
                         </div>
                     </div>
                 ))}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
