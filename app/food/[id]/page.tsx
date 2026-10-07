"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Clock, Info } from 'lucide-react'
import { mockFoodItems, formatTZS } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/Button'

export default function FoodDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useLanguage()

  const item = mockFoodItems.find(f => f.id === params.id)

  if (!item) {
    return <div className="p-8 text-center">Food not found</div>
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-24 h-screen overflow-y-auto scrollbar-hide relative">

      {/* Top Nav */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-brand-dark hover:bg-white"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Header Image */}
      <div className="relative h-72 w-full">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-extrabold mb-1">{item.name}</h1>
          <p className="text-lg font-medium opacity-90">{item.businessName}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">

        {/* Important Concept: What you get */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-gray">
          <div className="flex items-center mb-3 text-brand-dark">
            <Info size={20} className="mr-2 text-brand-orange" />
            <h2 className="font-bold text-lg">{t('food.what_you_get')}</h2>
          </div>
          <ul className="space-y-2">
            {item.itemsList.map((listItem, i) => (
              <li key={i} className="flex items-center text-brand-text">
                <span className="w-2 h-2 bg-brand-green rounded-full mr-3"></span>
                {listItem}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-gray flex justify-between items-center">
          <div>
            <p className="text-sm text-brand-muted line-through">{formatTZS(item.originalPrice)}</p>
            <p className="text-2xl font-extrabold text-brand-orange">{formatTZS(item.kijikoPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-brand-muted mb-1">{t('food.you_save')}</p>
            <div className="bg-green-100 text-brand-green px-3 py-1 rounded-full text-sm font-bold">
              {formatTZS(item.originalPrice - item.kijikoPrice)}
            </div>
          </div>
        </div>

        {/* Pickup Details */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-gray space-y-4">
          <div className="flex items-start">
            <Clock className="text-brand-orange mr-3 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-brand-dark">{t('food.pickup')}</p>
              <p className="text-brand-text">Today, {item.pickupStart} – {item.pickupEnd}</p>
            </div>
          </div>
          <div className="w-full h-px bg-gray-100 my-2"></div>
          <div className="flex items-start">
            <MapPin className="text-brand-orange mr-3 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-brand-dark">{item.businessName}</p>
              <p className="text-brand-text text-sm">{item.address}</p>
              <p className="text-brand-muted text-xs mt-1">{item.distance} away</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-brand-gray p-4 z-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-muted">{item.quantity} {t('food.available')}</span>
        </div>
        <Link href={`/checkout/${item.id}`} className="w-full">
          <Button fullWidth size="lg">
            {t('food.reserve')} {formatTZS(item.kijikoPrice)}
          </Button>
        </Link>
      </div>
    </div>
  )
}
