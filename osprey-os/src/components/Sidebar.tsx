"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Tent,
  Truck,
  Users,
  DollarSign,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Camp Ops', href: '/camp', icon: Tent },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'HR & Staff', href: '/hr', icon: Users },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Security', href: '/security', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">OSPREY <span className="text-slate-400 font-light">OS</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            JD
          </div>
          <div className="text-xs">
            <p className="font-medium text-slate-900">Juma Driver</p>
            <p className="text-slate-500">Baobab Camps</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
