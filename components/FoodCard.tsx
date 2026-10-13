import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FoodItem } from '@/lib/data'

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
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-brand-text leading-tight">{item.name}</h3>
              <p className="text-sm text-brand-muted">{item.category}</p>
            </div>
            <div className="text-right">
              <span className="bg-orange-100 text-brand-orange px-3 py-1 rounded-full text-sm font-bold">
                1 Meal
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
