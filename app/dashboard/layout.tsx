import Link from "next/link";
import { LayoutDashboard, Users, Network, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-soft-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-sand flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gold">OSPREY</h1>
          <p className="text-xs text-gray-400 mt-1">Enterprise OS</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/nodes" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Network size={20} />
            <span>Nodes</span>
          </Link>
          <Link href="/dashboard/users" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Users size={20} />
            <span>Users & Roles</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 rounded hover:bg-white/10 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
            <button className="flex items-center space-x-3 p-3 w-full rounded hover:bg-white/10 transition-colors text-left">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 justify-between">
            <h2 className="text-xl font-semibold text-navy">Overview</h2>
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white text-sm">
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
