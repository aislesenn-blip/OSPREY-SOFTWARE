"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { mockFoodItems, formatTZS } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/Button'

export default function Checkout({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [isProcessing, setIsProcessing] = useState(false)

  const item = mockFoodItems.find(f => f.id === params.id)

  if (!item) return <div className="p-8 text-center">Food not found</div>

  const total = item.kijikoPrice * quantity

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      router.push(`/order-confirmation/${item.id}?qty=${quantity}`)
    }, 1500)
  }

  const paymentOptions = [
    { id: 'mpesa', name: 'M-Pesa', color: 'bg-[#5CB85C]', logo: 'M' },
    { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-[#0033A0]', logo: 'T' },
    { id: 'airtel', name: 'Airtel Money', color: 'bg-[#FF0000]', logo: 'A' },
    { id: 'halopesa', name: 'HaloPesa', color: 'bg-[#FF6A13]', logo: 'H' },
  ]

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
            <p className="text-sm text-brand-muted mb-2">{item.businessName}</p>
            <p className="font-bold text-brand-orange">{formatTZS(item.kijikoPrice)}</p>
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

        {/* Payment Methods */}
        <div>
          <h3 className="font-bold text-brand-dark mb-3 px-1">{t('checkout.pay_with')}</h3>
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`bg-white p-4 rounded-xl border-2 flex items-center cursor-pointer transition-colors ${
                  paymentMethod === option.id ? 'border-brand-orange shadow-sm' : 'border-transparent border-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${option.color} flex items-center justify-center text-white font-bold mr-4`}>
                  {option.logo}
                </div>
                <span className="flex-1 font-medium text-brand-dark">{option.name}</span>
                {paymentMethod === option.id && <CheckCircle2 className="text-brand-orange" size={20} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-brand-gray p-4 z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-brand-dark">{t('checkout.total')}</span>
          <span className="text-2xl font-extrabold text-brand-dark">{formatTZS(total)}</span>
        </div>
        <Button fullWidth size="lg" onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : `${t('checkout.pay_btn')} ${formatTZS(total)}`}
        </Button>
      </div>
    </div>
  )
}
