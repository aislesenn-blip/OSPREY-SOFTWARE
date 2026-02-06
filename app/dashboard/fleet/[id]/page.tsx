"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle, Trip } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Fuel, Wrench, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch vehicle
    const { data: vData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (vData) {
      setVehicle(vData);

      // Fetch recent trips
      const { data: tData } = await supabase
        .from("trips")
        .select("*")
        .eq("vehicle_id", params.id)
        .order("start_time", { ascending: false })
        .limit(5);

      if (tData) setTrips(tData);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-8">Loading vehicle details...</div>;
  if (!vehicle) return <div className="p-8">Vehicle not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fleet">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">
            {vehicle.make} {vehicle.model} ({vehicle.registration_number})
          </h2>
          <p className="text-muted-foreground">Vehicle Details & History</p>
        </div>
        <div className="ml-auto flex gap-2">
           <Button variant="outline"><Wrench className="mr-2 h-4 w-4"/> Maintenance</Button>
           <Button className="bg-[#0A192F] hover:bg-[#1B4D3E]"><MapPin className="mr-2 h-4 w-4"/> New Trip</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg px-4 py-1" variant={
              vehicle.status === 'active' ? 'success' :
              vehicle.status === 'maintenance' ? 'warning' : 'destructive'
            }>
              {vehicle.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Odometer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.current_odometer.toLocaleString()} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Service Due In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(vehicle.service_interval_km - (vehicle.current_odometer - vehicle.last_service_km)).toLocaleString()} km
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Last 5 trips recorded for this vehicle.</CardDescription>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips recorded.</p>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{trip.purpose || "Unspecified Trip"}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.start_time ? formatDate(trip.start_time) : 'No Date'} • {trip.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {trip.end_odometer && trip.start_odometer
                          ? `${trip.end_odometer - trip.start_odometer} km`
                          : 'In Progress'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
