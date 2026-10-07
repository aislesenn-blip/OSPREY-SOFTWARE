"use client"

import React from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useLanguage } from '@/lib/i18n'
import { User, Settings, CreditCard, HelpCircle, LogOut } from 'lucide-react'

export default function Profile() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide h-screen">

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-brand-dark mb-6">{t('nav.profile')}</h1>

        <div className="flex items-center">
          <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            J
          </div>
          <div>
            <h2 className="font-bold text-xl text-brand-dark">John Doe</h2>
            <p className="text-brand-muted">+255 712 345 678</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">

        {/* Settings Group */}
        <div>
          <h3 className="font-bold text-brand-muted text-sm uppercase tracking-wider mb-3 px-1">Settings</h3>
          <div className="bg-white rounded-xl shadow-sm border border-brand-gray overflow-hidden">

            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="text-brand-muted mr-3" size={20} />
                <span className="font-medium text-brand-dark">Language</span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${language === 'en' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-muted'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('sw')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${language === 'sw' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-muted'}`}
                >
                  SW
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 flex items-center">
              <User className="text-brand-muted mr-3" size={20} />
              <span className="font-medium text-brand-dark">Personal Information</span>
            </div>

            <div className="p-4 flex items-center">
              <CreditCard className="text-brand-muted mr-3" size={20} />
              <span className="font-medium text-brand-dark">Payment Methods</span>
            </div>

          </div>
        </div>

        {/* Support Group */}
        <div>
          <h3 className="font-bold text-brand-muted text-sm uppercase tracking-wider mb-3 px-1">Support</h3>
          <div className="bg-white rounded-xl shadow-sm border border-brand-gray overflow-hidden">
            <div className="p-4 flex items-center">
              <HelpCircle className="text-brand-muted mr-3" size={20} />
              <span className="font-medium text-brand-dark">Help Center</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-white rounded-xl shadow-sm border border-red-100 p-4 flex items-center justify-center text-red-500 font-bold mt-4 hover:bg-red-50 transition-colors">
          <LogOut className="mr-2" size={20} />
          Log Out
        </button>

      </div>

      <BottomNav />
    </div>
  )
}
