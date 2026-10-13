"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, PackageSearch, ClipboardList, User } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { name: t('nav.home'), path: '/home', icon: Utensils },
    { name: t('nav.packages'), path: '/packages', icon: PackageSearch },
    { name: t('nav.orders'), path: '/orders', icon: ClipboardList },
    { name: t('nav.profile'), path: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-brand-gray z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-brand-orange' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
