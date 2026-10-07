"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { BottomNav } from '@/components/BottomNav'
import { mockOrders, formatTZS } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'

export default function Orders() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const filteredOrders = mockOrders.filter(order => order.status === tab)

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide h-screen">

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-0 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-brand-dark mb-6">{t('nav.orders')}</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['upcoming', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setTab(status)}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors capitalize ${
                tab === status
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-brand-muted hover:text-brand-text'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-brand-gray">
                <div className="p-4 flex items-center border-b border-gray-100">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                    <Image src={order.foodItem.image} alt={order.foodItem.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-dark leading-tight">{order.foodItem.name}</h3>
                    <p className="text-sm text-brand-muted">{order.foodItem.businessName}</p>
                    <p className="text-sm font-semibold text-brand-orange mt-1">{formatTZS(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-brand-muted mr-2">Status:</span>
                    <span className={`font-bold capitalize ${
                      order.status === 'upcoming' ? 'text-brand-orange' :
                      order.status === 'completed' ? 'text-brand-green' : 'text-red-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === 'upcoming' && (
                    <div className="font-mono font-bold bg-white px-3 py-1 rounded border border-gray-200 text-brand-dark">
                      {order.pickupCode}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-brand-muted mt-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="font-medium">No {tab} orders</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
