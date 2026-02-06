'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Building2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Fleet', href: '/dashboard/fleet', icon: Truck },
  { name: 'HR & Staff', href: '/dashboard/hr', icon: Users },
  { name: 'Operations', href: '/dashboard/operations/manifest', icon: CalendarDays },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Admin', href: '/dashboard/admin', icon: Building2 },
]

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-osprey-navy text-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
        <svg
          className="h-8 w-8 text-white mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="text-xl font-light tracking-wide">OSPREY</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-white' : 'text-white/60 group-hover:text-white',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
            <p className="text-xs font-medium text-white/50 capitalize">{profile?.role || 'Staff'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-4 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
