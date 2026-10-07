"use client"

import React from 'react'
import { BottomNav } from '@/components/BottomNav'
import { FoodCard } from '@/components/FoodCard'
import { mockFoodItems } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { MapPin } from 'lucide-react'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide">

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center text-brand-orange font-medium text-sm mb-1">
          <MapPin size={16} className="mr-1" />
          <span>Dar es Salaam</span>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-dark">{t('home.title')}</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {mockFoodItems.map((item) => (
          <FoodCard key={item.id} item={item} t={t} />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
