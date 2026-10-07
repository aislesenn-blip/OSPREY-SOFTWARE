import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FoodItem, formatTZS } from '@/lib/data'
import { MapPin, Clock } from 'lucide-react'

type FoodCardProps = {
  item: FoodItem
  t: (key: string) => string
}

export function FoodCard({ item, t }: FoodCardProps) {
  return (
    <Link href={`/food/${item.id}`} className="block w-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-brand-gray mb-4 hover:shadow-md transition-shadow">
        <div className="relative h-48 w-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-bold text-brand-dark shadow-sm">
            {item.quantity} {t('food.available')}
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-brand-text leading-tight">{item.name}</h3>
              <p className="text-sm text-brand-muted">{item.businessName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-orange text-lg">{formatTZS(item.kijikoPrice)}</p>
              <p className="text-xs text-brand-muted line-through">{formatTZS(item.originalPrice)}</p>
            </div>
          </div>

          <div className="flex items-center text-xs text-brand-muted mt-3 space-x-4">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{item.pickupStart} - {item.pickupEnd}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{item.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
