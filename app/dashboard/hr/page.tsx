"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { createEmployeeAction } from "@/lib/actions";

export default function HRPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch Employees with Location
    // Note: Supabase join syntax
    const { data: empData } = await supabase
      .from("employees")
      .select("*, location:department_id(name)")
      .order("last_name");

    const { data: locData } = await supabase.from("locations").select("*");

    if (empData) setEmployees(empData);
    if (locData) setLocations(locData);
    setLoading(false);
  }

  // Simple Net Pay Calculation (Mock logic as per "Universal" requirement)
  // Base - 10% Tax - 5% Deductions
  const calculateNetPay = (basic: number) => {
      const tax = basic * 0.10;
      const deductions = basic * 0.05;
      return basic - tax - deductions;
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">HR & Payroll</h2>
          <p className="text-muted-foreground">Manage human capital and assignments.</p>
        </div>
        <Button
            className="bg-[#0A192F] hover:bg-[#1B4D3E]"
            onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p>No employees found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Assigned Branch</TableHead>
                  <TableHead className="text-right">Basic Salary</TableHead>
                  <TableHead className="text-right">Est. Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.first_name} {emp.last_name}</TableCell>
                    <TableCell>{emp.job_title}</TableCell>
                    <TableCell className="flex items-center gap-2">
                        {emp.location ? (
                            <><MapPin className="h-3 w-3 text-muted-foreground" /> {emp.location.name}</>
                        ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(emp.basic_salary)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                        {formatCurrency(calculateNetPay(emp.basic_salary))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-xs">
                        {emp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-lg bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Add New Employee</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4"/></Button>
                  </CardHeader>
                  <CardContent>
                      <form action={async (formData) => {
                          const res = await createEmployeeAction(formData);
                          if (res?.error) { alert(res.error); return; }
                          setShowAddModal(false);
                          fetchData();
                      }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">First Name</label>
                                  <Input name="firstName" required placeholder="Jane"/>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Last Name</label>
                                  <Input name="lastName" required placeholder="Doe"/>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Email</label>
                              <Input name="email" type="email" required placeholder="jane.doe@company.com"/>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Job Title</label>
                                  <Input name="jobTitle" required placeholder="Manager"/>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm font-medium">Basic Salary</label>
                                  <Input name="basicSalary" type="number" required placeholder="0.00"/>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Assign to Location</label>
                              <select name="locationId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                  <option value="">Headquarters / Unassigned</option>
                                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
                              </select>
                          </div>
                          <Button type="submit" className="w-full bg-[#0A192F]">Save Employee</Button>
                      </form>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
}
