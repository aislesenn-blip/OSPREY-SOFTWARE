"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, CheckCircle2, MapPin, Clock } from 'lucide-react'
import { mockFoodItems, mockPickupPoints, mockTimeWindows } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/Button'

export default function Checkout({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [pickupPoint, setPickupPoint] = useState(mockPickupPoints[0].id)
  const [timeWindow, setTimeWindow] = useState(mockTimeWindows[0].id)
  const [isProcessing, setIsProcessing] = useState(false)

  const item = mockFoodItems.find(f => f.id === params.id)

  if (!item) return <div className="p-8 text-center">Food not found</div>

  const handleConfirm = () => {
    setIsProcessing(true)
    setTimeout(() => {
      router.push(`/order-confirmation/${item.id}?qty=${quantity}`)
    }, 1500)
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-24 h-screen overflow-y-auto scrollbar-hide">

      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-brand-dark p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark">{t('checkout.title')}</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-brand-gray flex items-center">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-4">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-brand-dark">{item.name}</h2>
            <p className="text-sm text-brand-muted mb-2">{item.category}</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-brand-gray flex justify-between items-center">
          <span className="font-medium text-brand-dark">{t('checkout.quantity')}</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-brand-dark"
            >-</button>
            <span className="font-bold text-lg w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(item.quantity, quantity + 1))}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-brand-dark"
            >+</button>
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <h3 className="font-bold text-brand-dark mb-3 px-1 flex items-center">
            <MapPin size={18} className="mr-2 text-brand-orange" />
            {t('checkout.location')}
          </h3>
          <div className="space-y-3">
            {mockPickupPoints.map((point) => (
              <div
                key={point.id}
                onClick={() => setPickupPoint(point.id)}
                className={`bg-white p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  pickupPoint === point.id ? 'border-brand-orange shadow-sm' : 'border-transparent border-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-brand-dark">{point.name}</p>
                    <p className="text-sm text-brand-muted">{point.address}</p>
                  </div>
                  {pickupPoint === point.id && <CheckCircle2 className="text-brand-orange" size={20} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Window */}
        <div>
          <h3 className="font-bold text-brand-dark mb-3 px-1 flex items-center">
            <Clock size={18} className="mr-2 text-brand-orange" />
            {t('checkout.time')}
          </h3>
          <div className="space-y-3">
            {mockTimeWindows.map((tw) => (
              <div
                key={tw.id}
                onClick={() => setTimeWindow(tw.id)}
                className={`bg-white p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${
                  timeWindow === tw.id ? 'border-brand-orange shadow-sm' : 'border-transparent border-gray-100'
                }`}
              >
                <span className="font-medium text-brand-dark">{tw.start} - {tw.end}</span>
                {timeWindow === tw.id && <CheckCircle2 className="text-brand-orange" size={20} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-brand-gray p-4 z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-brand-dark">Cost</span>
          <span className="text-2xl font-extrabold text-brand-dark">{quantity} Meal{quantity > 1 ? 's' : ''}</span>
        </div>
        <Button fullWidth size="lg" onClick={handleConfirm} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : t('checkout.confirm_btn')}
        </Button>
      </div>
    </div>
  )
}
