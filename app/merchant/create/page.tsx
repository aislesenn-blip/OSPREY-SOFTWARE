"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Camera, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function CreateListing() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      router.push('/merchant')
    }, 1000)
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-light h-screen overflow-y-auto scrollbar-hide">

      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-brand-dark p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark">{t('merchant.create')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col">

        {/* Photo Upload Placeholder */}
        <div className="w-full h-40 bg-gray-200 rounded-xl mb-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-brand-muted cursor-pointer hover:bg-gray-100 transition-colors">
          <Camera size={32} className="mb-2" />
          <span className="font-medium">Add Food Photo</span>
        </div>

        <div className="space-y-5 flex-1">
          <Input
            label={t('merchant.what_selling')}
            placeholder="e.g. Chicken & Chips"
            required
          />

          <Input
            label={t('merchant.how_many')}
            type="number"
            min="1"
            placeholder="5"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('merchant.original_price')}
              type="number"
              min="0"
              placeholder="8000"
              required
            />
            <Input
              label={t('merchant.kijiko_price')}
              type="number"
              min="0"
              placeholder="4000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1 flex items-center">
              <Clock size={16} className="mr-1" /> Pickup Time
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input type="time" required />
              <Input type="time" required />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
            <p className="text-sm text-brand-dark font-medium mb-1">Items Included:</p>
            <textarea
              className="w-full bg-white p-3 rounded-lg border border-gray-300 focus:ring-brand-orange focus:border-transparent focus:outline-none focus:ring-2 text-sm"
              rows={3}
              placeholder="List exact items (e.g. 1 piece chicken, 1 portion chips)"
              required
            ></textarea>
            <p className="text-xs text-brand-muted mt-2">Customers must know exactly what they are buying. No surprise bags.</p>
          </div>
        </div>

        <div className="mt-8 mb-4">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : t('merchant.post_listing')}
          </Button>
        </div>

      </form>
    </div>
  )
}
