'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ArrowLeft, Plus } from 'lucide-react'
import { Trip } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select(`
          *,
          vehicles (registration_number),
          profiles:driver_id (full_name)
        `)
        .order('start_time', { ascending: false })

      if (!error && data) setTrips(data)
      setLoading(false)
    }
    fetchTrips()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/fleet">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-light text-osprey-navy">Trip Logs</h2>
          <p className="text-osprey-navy/60">History of vehicle movements.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Trips</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Trip
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route / Purpose</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-osprey-navy/50">
                    Loading trips...
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-osprey-navy/50">
                    No trips logged.
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip: any) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-mono text-xs">{formatDate(trip.start_time)}</TableCell>
                    <TableCell className="font-medium">{trip.vehicles?.registration_number}</TableCell>
                    <TableCell>{trip.profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="text-sm">{trip.route}</div>
                      <div className="text-xs text-osprey-navy/50">{trip.purpose}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {trip.end_km ? `${trip.end_km - trip.start_km} km` : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={trip.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
