"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Forms & Requests</h2>
           <p className="text-muted-foreground">Submit and approve internal requests.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
          {['Leave Request', 'Purchase Request', 'Fuel Request', 'Maintenance Request'].map(form => (
              <Card key={form} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600"/>
                      </div>
                      <h3 className="font-medium">{form}</h3>
                      <Button variant="outline" size="sm" className="w-full">Start</Button>
                  </CardContent>
              </Card>
          ))}
      </div>
    </div>
  );
}
