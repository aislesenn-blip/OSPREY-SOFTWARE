'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Plus, Wrench } from 'lucide-react'
import { Vehicle } from '@/types'
import Link from 'next/link'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVehicles() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('registration_number')

      if (!error && data) setVehicles(data)
      setLoading(false)
    }
    fetchVehicles()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-osprey-navy">Fleet Command</h2>
          <p className="text-osprey-navy/60 mt-2">Manage vehicles, trips, and maintenance.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/fleet/trips">
             <Button variant="outline">View Trips</Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Make / Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Current KM</TableHead>
                <TableHead className="text-right">Next Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-osprey-navy/50">
                    Loading fleet...
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-osprey-navy/50">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium">{vehicle.registration_number}</TableCell>
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell className="capitalize">{vehicle.type.replace('_', ' ')}</TableCell>
                    <TableCell className="text-right font-mono">{vehicle.current_km.toLocaleString()} km</TableCell>
                    <TableCell className="text-right font-mono text-osprey-navy/60">{vehicle.next_service_km?.toLocaleString()} km</TableCell>
                    <TableCell>
                      <StatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Wrench className="h-4 w-4 text-osprey-navy/40" />
                      </Button>
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
