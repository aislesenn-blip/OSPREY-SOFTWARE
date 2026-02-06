import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Network,
  Settings,
  LogOut,
  Briefcase,
  DollarSign,
  PieChart,
  ShoppingCart,
  Package,
  Monitor,
  MessageSquare,
  QrCode,
  FileText
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-soft-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-sand flex flex-col overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gold">OSPREY</h1>
          <p className="text-xs text-gray-400 mt-1">Enterprise OS</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Core</p>
          </div>
          <Link href="/dashboard/nodes" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Network size={20} />
            <span>Nodes</span>
          </Link>
          <Link href="/dashboard/users" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Users size={20} />
            <span>Users & Roles</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operations</p>
          </div>
          <Link href="/dashboard/finance/journals" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <DollarSign size={20} />
            <span>Finance</span>
          </Link>
          <Link href="/dashboard/budget" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <PieChart size={20} />
            <span>Budget</span>
          </Link>
          <Link href="/dashboard/hr/employees" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Briefcase size={20} />
            <span>HR & Payroll</span>
          </Link>
          <Link href="/dashboard/procurement/pr" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <ShoppingCart size={20} />
            <span>Procurement</span>
          </Link>
          <Link href="/dashboard/inventory/stock" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Package size={20} />
            <span>Inventory</span>
          </Link>
          <Link href="/dashboard/assets" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Monitor size={20} />
            <span>Assets</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Communication</p>
          </div>
          <Link href="/dashboard/feed" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <MessageSquare size={20} />
            <span>Org Feed</span>
          </Link>
          <Link href="/dashboard/gate-pass" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <QrCode size={20} />
            <span>Gate Pass</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
          </div>
          <Link href="/dashboard/reports" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <FileText size={20} />
            <span>Reports</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
            <button className="flex items-center space-x-3 p-3 w-full rounded hover:bg-white/10 transition-colors text-left text-red-400 hover:text-red-300">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 justify-between border-b border-gray-200">
            <h2 className="text-xl font-semibold text-navy">Overview</h2>
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white text-sm font-bold shadow-md">
                    U
                </div>
            </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
