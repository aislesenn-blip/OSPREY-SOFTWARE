"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  CalendarDays,
  Settings,
  FileText,
  LogOut,
  Mountain
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fleet Control", href: "/dashboard/fleet", icon: Truck },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Staff & HR", href: "/dashboard/hr", icon: Users },
  { name: "Operations", href: "/dashboard/operations", icon: CalendarDays },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#0A192F] text-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Mountain className="h-6 w-6 text-[#E6DDC4] mr-2" />
        <span className="text-lg font-bold tracking-tight text-[#E6DDC4]">OSPREY</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-[#1B4D3E] text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
