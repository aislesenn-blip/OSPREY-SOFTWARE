"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Monitor } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Asset Management</h2>
           <p className="text-muted-foreground">Track equipment, machinery, and furniture.</p>
        </div>
        <Button className="bg-[#0A192F]"><Plus className="mr-2 h-4 w-4"/> New Asset</Button>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Asset Register</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Asset Tag</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-20"/>
                              No assets found.
                          </TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
