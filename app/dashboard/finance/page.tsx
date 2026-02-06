"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <div>
         <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Finance & Accounting</h2>
         <p className="text-muted-foreground">General Ledger and Financial Statements.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">$0.00</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">$0.00</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Equity</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">$0.00</div></CardContent>
          </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No transactions recorded.</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
