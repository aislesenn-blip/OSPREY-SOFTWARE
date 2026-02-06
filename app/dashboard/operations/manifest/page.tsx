'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Calendar, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ManifestPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchManifest() {
      // Joining guests with bookings to get dates
      const { data, error } = await supabase
        .from('guests')
        .select(`
          *,
          bookings (
            reference_number,
            start_date,
            end_date,
            status
          )
        `)
        // .gte('bookings.start_date', new Date().toISOString()) // In real app, filter by date

      if (!error && data) setGuests(data)
      setLoading(false)
    }
    fetchManifest()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-osprey-navy">Guest Manifest</h2>
          <p className="text-osprey-navy/60 mt-2">Daily operational overview of arrivals and departures.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline">
             <Filter className="mr-2 h-4 w-4" />
             Filter
           </Button>
           <Button variant="outline">
             <Calendar className="mr-2 h-4 w-4" />
             Select Date
           </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Arrivals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Room Pref</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-osprey-navy/50">
                    Loading manifest...
                  </TableCell>
                </TableRow>
              ) : guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-osprey-navy/50">
                    No active bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.full_name}</TableCell>
                    <TableCell className="font-mono text-xs">{guest.bookings?.reference_number}</TableCell>
                    <TableCell>{formatDate(guest.bookings?.start_date)}</TableCell>
                    <TableCell>{formatDate(guest.bookings?.end_date)}</TableCell>
                    <TableCell className="text-sm">{guest.room_preference || '-'}</TableCell>
                    <TableCell className="text-sm text-red-600">{guest.dietary_requirements || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={guest.bookings?.status || 'confirmed'} />
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
