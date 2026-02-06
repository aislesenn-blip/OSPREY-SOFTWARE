'use client'

import { updateOrganizationAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mountain } from 'lucide-react'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A192F] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#E6DDC4] flex items-center justify-center">
            <Mountain className="h-6 w-6 text-[#0A192F]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#E6DDC4]">OSPREY</h1>
          <p className="text-[#8892b0] text-sm tracking-widest uppercase">Universal Operating System</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-[#0A192F] text-center">Setup Organization</CardTitle>
            <CardDescription className="text-center">
              Configure your workspace for your industry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
                const res = await updateOrganizationAction(formData);
                if (res?.error) alert(res.error);
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  name="companyName"
                  placeholder="e.g. Acme Construction"
                  className="bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                   {['Retail', 'Construction', 'Logistics', 'Service', 'Manufacturing', 'Tourism'].map((ind) => (
                     <label key={ind} className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 [&:has(input:checked)]:bg-blue-50 [&:has(input:checked)]:border-blue-500">
                        <input type="radio" name="industry" value={ind} className="accent-[#0A192F]" required />
                        <span className="text-sm">{ind}</span>
                     </label>
                   ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0A192F] hover:bg-[#1B4D3E] text-white transition-all duration-300 h-11"
              >
                Launch Workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
