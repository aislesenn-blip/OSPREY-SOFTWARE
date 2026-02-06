import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Truck, Users, Package, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-light text-osprey-navy">Dashboard</h2>
        <p className="text-osprey-navy/60 mt-2">Overview of your operations today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-osprey-navy/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-osprey-navy/60">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-osprey-navy/60">Currently on safari</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff on Duty</CardTitle>
            <Users className="h-4 w-4 text-osprey-navy/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-osprey-navy/60">Across 3 camps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-osprey-navy/60">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Trip Started</p>
                  <p className="text-sm text-osprey-navy/60">Vehicle T123 left for Serengeti</p>
                </div>
                <div className="ml-auto font-medium text-sm text-osprey-navy/60">Just now</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Fuel Logged</p>
                  <p className="text-sm text-osprey-navy/60">45L added to Land Cruiser T456</p>
                </div>
                <div className="ml-auto font-medium text-sm text-osprey-navy/60">2h ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Stock Received</p>
                  <p className="text-sm text-osprey-navy/60">Kitchen supplies at Main Camp</p>
                </div>
                <div className="ml-auto font-medium text-sm text-osprey-navy/60">5h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Active</span>
                   <span className="text-sm font-bold text-green-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Maintenance</span>
                   <span className="text-sm font-bold text-yellow-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Available</span>
                   <span className="text-sm font-bold text-osprey-navy">2</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
