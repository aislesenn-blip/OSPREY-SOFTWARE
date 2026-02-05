import {
  DollarSign,
  Users,
  Tent,
  Truck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
        <p className="text-slate-500">Welcome to Osprey Command Center (Baobab Camps)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Revenue (MTD)</h3>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">$124,500</p>
          <div className="flex items-center mt-2 text-xs text-emerald-600">
            <TrendingUp size={14} className="mr-1" />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Guests In-House</h3>
            <Tent className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">42 / 60</p>
          <div className="text-xs text-slate-500 mt-2">70% Occupancy</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Active Staff</h3>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">18</p>
          <div className="text-xs text-slate-500 mt-2">3 on Leave</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Fleet Status</h3>
            <Truck className="text-amber-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">8 / 12</p>
          <div className="flex items-center mt-2 text-xs text-amber-600">
            <AlertCircle size={14} className="mr-1" />
            <span>2 Maintenance, 2 Blocked</span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Urgent Attention</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">Guest Allergy Alert</p>
                <p className="text-xs opacity-90">Room 4 (Smith) - Severe Nut Allergy. Kitchen notified.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
              <Truck size={18} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">Vehicle Blocked</p>
                <p className="text-xs opacity-90">T 888 AAA - Service Overdue by 1,000 km.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">Fuel Issued</p>
                  <p className="text-slate-500 text-xs">Land Cruiser T 450 DFG</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">80 Liters</p>
                  <p className="text-slate-500 text-xs">Today, 10:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
