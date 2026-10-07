'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const MOBILE_NETWORKS = [
  { id: 'mpesa', name: 'M-Pesa', color: 'bg-red-600' },
  { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-blue-600' },
  { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500' },
  { id: 'halopesa', name: 'HaloPesa', color: 'bg-orange-500' },
];

export default function Checkout({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data based on ID
  const item = {
    foodName: '1 Chicken Biryani Box',
    businessName: 'Mambo Restaurant',
    price: 5000,
    quantity: 1, // hardcoded for simplicity
  };

  const handlePayment = () => {
    if (!selectedNetwork || !phoneNumber) return;

    setIsProcessing(true);
    // Simulate mobile money push and confirmation
    setTimeout(() => {
      router.push(`/checkout/success?id=${params.id}`);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
      </header>

      <main className="flex-1 p-4 pb-24">
        {/* Order Summary */}
        <section className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-gray-900">{item.foodName}</p>
              <p className="text-sm text-gray-500">{item.businessName}</p>
            </div>
            <p className="font-bold text-gray-900">TZS {item.price.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <span>Quantity: {item.quantity}</span>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total to pay</span>
            <span className="text-xl font-black text-green-700">TZS {item.price.toLocaleString()}</span>
          </div>
        </section>

        {/* Payment Method - Tanzania Focus */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Pay with Mobile Money</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {MOBILE_NETWORKS.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  selectedNetwork === network.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${network.color} mb-2 flex items-center justify-center`}>
                  <Smartphone className="text-white w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${selectedNetwork === network.id ? 'text-green-700' : 'text-gray-700'}`}>
                  {network.name}
                </span>
              </button>
            ))}
          </div>

          {selectedNetwork && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+255</span>
                <input
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We will send a payment prompt to this number.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <button
          onClick={handlePayment}
          disabled={!selectedNetwork || phoneNumber.length < 9 || isProcessing}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex justify-center items-center ${
            !selectedNetwork || phoneNumber.length < 9
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
          }`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            `Pay TZS ${item.price.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
}
