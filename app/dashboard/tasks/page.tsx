"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Task Management</h2>
           <p className="text-muted-foreground">Track workflows and assignments.</p>
        </div>
        <Button className="bg-[#0A192F]"><Plus className="mr-2 h-4 w-4"/> New Task</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         {['To Do', 'In Progress', 'Done'].map(status => (
             <Card key={status} className="bg-slate-50">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium uppercase text-muted-foreground">{status}</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-muted-foreground text-sm">
                         No tasks
                     </div>
                 </CardContent>
             </Card>
         ))}
      </div>
    </div>
  );
}
