'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Plus, UserPlus } from 'lucide-react'
import { Staff } from '@/types'

export default function HRPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStaff() {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('last_name')

      if (!error && data) setStaff(data)
      setLoading(false)
    }
    fetchStaff()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-osprey-navy">Human Resources</h2>
          <p className="text-osprey-navy/60 mt-2">Manage staff, payroll, and leave.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-osprey-navy/50">
                    Loading staff...
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-osprey-navy/50">
                    No staff records found.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.first_name} {employee.last_name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-osprey-navy/60">{employee.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} />
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
