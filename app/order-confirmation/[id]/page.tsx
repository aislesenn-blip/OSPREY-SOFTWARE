"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, MapPin } from 'lucide-react'
import { mockFoodItems } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/Button'

export default function OrderConfirmation({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [pickupCode, setPickupCode] = useState('')

  const item = mockFoodItems.find(f => f.id === params.id)
  const qty = searchParams.get('qty') || '1'

  useEffect(() => {
    // Generate a random 4 digit code like KJ-XXXX
    const code = Math.floor(1000 + Math.random() * 9000)
    setPickupCode(`KJ-${code}`)
  }, [])

  if (!item) return <div className="p-8 text-center">Order not found</div>

  return (
    <div className="flex-1 flex flex-col bg-brand-light h-screen overflow-y-auto scrollbar-hide">

      <div className="flex-1 p-6 flex flex-col items-center pt-16 pb-24">

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-brand-green" />
        </div>

        <h1 className="text-3xl font-extrabold text-brand-dark mb-8 text-center">
          {t('order.success')}
        </h1>

        {/* Order Card */}
        <div className="bg-white w-full rounded-2xl shadow-md border border-brand-gray p-6 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-brand-muted uppercase tracking-wider font-bold mb-1">{t('order.pickup_code')}</p>
            <p className="text-4xl font-black text-brand-orange tracking-widest bg-orange-50 py-3 rounded-lg border-2 border-orange-100">{pickupCode}</p>
          </div>

          <div className="w-full h-px bg-gray-100 my-4 border-t border-dashed border-gray-300"></div>

          <div className="py-2">
            <h2 className="font-bold text-xl text-brand-dark mb-1">{item.name} <span className="text-brand-orange">× {qty}</span></h2>
            <p className="text-brand-muted font-medium mb-4">{item.businessName}</p>

            <div className="space-y-3">
              <div className="flex items-start">
                <Clock className="text-brand-muted mr-3 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-brand-dark">Today, {item.pickupStart} – {item.pickupEnd}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-brand-muted mr-3 mt-0.5" size={18} />
                <div>
                  <p className="text-brand-dark">{item.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-brand-muted mb-8 max-w-[250px]">
          Show this code to the merchant when you arrive to pick up your food.
        </p>

      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-brand-gray p-4 z-50">
        <Button fullWidth size="lg" onClick={() => router.push('/orders')}>
          View My Orders
        </Button>
      </div>
    </div>
  )
}
