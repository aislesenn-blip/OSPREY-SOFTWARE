"use client"

import React, { useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { Input } from '@/components/Input'
import { FoodCard } from '@/components/FoodCard'
import { mockFoodItems } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'
import { Search, Map as MapIcon, List } from 'lucide-react'

export default function Discover() {
  const { t } = useLanguage()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ["Fast Food", "Local Food", "Bakery", "Vegetarian"]

  const filteredItems = mockFoodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide h-screen">

      {/* Header & Search */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm z-10">
        <h1 className="text-2xl font-extrabold text-brand-dark mb-4">{t('nav.discover')}</h1>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-brand-muted" />
          </div>
          <Input
            placeholder="Search food or business..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-brand-orange text-white'
                : 'bg-brand-gray text-brand-text hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-gray text-brand-text hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex justify-center my-4 px-4">
        <div className="bg-white p-1 rounded-lg flex shadow-sm w-full max-w-[250px]">
          <button
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md ${view === 'list' ? 'bg-brand-light text-brand-dark shadow-sm' : 'text-brand-muted'}`}
            onClick={() => setView('list')}
          >
            <List size={16} className="mr-2" /> List
          </button>
          <button
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md ${view === 'map' ? 'bg-brand-light text-brand-dark shadow-sm' : 'text-brand-muted'}`}
            onClick={() => setView('map')}
          >
            <MapIcon size={16} className="mr-2" /> Map
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {view === 'list' ? (
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => <FoodCard key={item.id} item={item} t={t} />)
            ) : (
              <div className="text-center text-brand-muted mt-10">No food found matching your criteria.</div>
            )}
          </div>
        ) : (
          <div className="bg-gray-200 w-full h-full min-h-[300px] rounded-xl flex items-center justify-center flex-col text-brand-muted shadow-inner relative overflow-hidden">
             {/* Map Placeholder */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] opacity-50 bg-cover bg-center"></div>
             <div className="relative z-10 bg-white/90 p-4 rounded-lg text-center shadow-lg border border-white/50 backdrop-blur-sm">
                <MapIcon size={32} className="mx-auto mb-2 text-brand-orange" />
                <p className="font-semibold text-brand-dark">Map view is simplified for this demo.</p>
                <p className="text-sm">In production, this would use Google Maps showing pins for nearby food.</p>
             </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
