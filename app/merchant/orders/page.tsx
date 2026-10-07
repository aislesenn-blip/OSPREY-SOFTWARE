"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { mockOrders } from '@/lib/data'
import { Input } from '@/components/Input'

export default function MerchantOrders() {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchCode, setSearchCode] = useState('')
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null)

  const upcomingOrders = mockOrders.filter(o => o.status === 'upcoming')

  const handleVerify = (code: string) => {
    setVerifiedCode(code)
    setTimeout(() => {
      setVerifiedCode(null)
      setSearchCode('')
    }, 2000)
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-light h-screen overflow-y-auto scrollbar-hide">

      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-brand-dark p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark">Pickup Verification</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Verification Input */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-gray">
          <h2 className="font-bold text-brand-dark mb-4 text-center">Verify Customer Pickup</h2>

          {verifiedCode ? (
            <div className="flex flex-col items-center justify-center py-4 text-brand-green">
              <CheckCircle2 size={48} className="mb-2" />
              <p className="font-bold text-lg">Order Verified!</p>
              <p className="text-sm font-mono mt-1">{verifiedCode}</p>
            </div>
          ) : (
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-brand-muted" />
                </div>
                <Input
                  placeholder="Enter code (e.g. KJ-1234)"
                  className="pl-10 font-mono"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                />
              </div>
              <button
                onClick={() => handleVerify(searchCode)}
                disabled={searchCode.length < 5}
                className="bg-brand-dark text-white px-6 rounded-lg font-bold disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          )}
        </div>

        {/* Upcoming List */}
        <div>
          <h3 className="font-bold text-brand-muted text-sm uppercase tracking-wider mb-3 px-1">Upcoming Pickups ({upcomingOrders.length})</h3>

          <div className="space-y-3">
            {upcomingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-brand-gray flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-brand-dark">{order.foodItem.name} <span className="text-brand-orange">×{order.quantity}</span></h4>
                  <p className="text-sm text-brand-muted">Pickup: {order.foodItem.pickupStart} - {order.foodItem.pickupEnd}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold bg-gray-100 px-3 py-1 rounded text-brand-dark border border-gray-200">
                    {order.pickupCode}
                  </div>
                  <button
                    onClick={() => handleVerify(order.pickupCode)}
                    className="text-brand-orange text-xs font-bold mt-2 hover:underline"
                  >
                    Mark Picked Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
