"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CommunicationPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-[#0A192F]">Communication</h2>
           <p className="text-muted-foreground">Internal announcements and chat.</p>
        </div>
        <Button className="bg-[#0A192F]">New Announcement</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5"/> Announcements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-8 text-center text-muted-foreground bg-slate-50 rounded-md border-dashed border">
                    No active announcements.
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5"/> Channels
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-2 hover:bg-slate-100 rounded cursor-pointer"># general</div>
                <div className="p-2 hover:bg-slate-100 rounded cursor-pointer"># operations</div>
                <div className="p-2 hover:bg-slate-100 rounded cursor-pointer"># hr-updates</div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
