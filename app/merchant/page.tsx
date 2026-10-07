"use client"

import React from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, Package, Store } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { formatTZS } from '@/lib/data'

export default function MerchantDashboard() {
  const { t } = useLanguage()

  const stats = {
    salesToday: 4,
    revenueRecovered: 16000,
    activeListings: 2
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide min-h-screen">

      {/* Header */}
      <div className="bg-brand-dark px-4 pt-12 pb-16 shadow-sm">
        <div className="flex justify-between items-center mb-6 text-white">
          <h1 className="text-xl font-extrabold">{t('merchant.dashboard')}</h1>
          <Store size={24} />
        </div>

        <h2 className="text-3xl font-black text-white mb-1">Mambo Restaurant</h2>
        <p className="text-brand-gray opacity-80 text-sm">Dar es Salaam, TZ</p>
      </div>

      {/* Stats Cards (Overlap header) */}
      <div className="px-4 -mt-10 space-y-4">

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
            <TrendingUp className="text-brand-orange" size={24} />
          </div>
          <div>
            <p className="text-sm text-brand-muted font-medium">{t('merchant.revenue_recovered')}</p>
            <p className="text-2xl font-black text-brand-dark">{formatTZS(stats.revenueRecovered)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-1">{t('merchant.sales_today')}</p>
            <p className="text-xl font-bold text-brand-dark">{stats.salesToday}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-1">Active Listings</p>
            <p className="text-xl font-bold text-brand-dark">{stats.activeListings}</p>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="p-4 mt-4 grid grid-cols-2 gap-4">
        <Link href="/merchant/create" className="bg-brand-orange text-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:bg-brand-orangeLight transition-colors">
          <Plus size={32} className="mb-2" />
          <span className="font-bold text-center">{t('merchant.create')}</span>
        </Link>
        <Link href="/merchant/orders" className="bg-brand-dark text-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:bg-gray-800 transition-colors">
          <Package size={32} className="mb-2" />
          <span className="font-bold text-center">{t('merchant.orders')}</span>
        </Link>
      </div>

      {/* Quick Tips */}
      <div className="px-4 mt-2">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h3 className="font-bold text-brand-green mb-1">Tip for today</h3>
          <p className="text-sm text-brand-green opacity-90">Clear photos and exact descriptions help food sell 3x faster on Kijiko.</p>
        </div>
      </div>

    </div>
  )
}
