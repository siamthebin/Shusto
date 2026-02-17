'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface SSLCommerz {
  success: boolean
  post_params: any
  sslcommerz_url: string
  order_id: string
  message: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartData = localStorage.getItem('checkout_cart')
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData)
        setCartItems(parsed.items || [])
        setCustomerInfo({
          name: parsed.customerName || '',
          email: '',
          phone: parsed.customerPhone || '',
        })
      } catch (err) {
        console.error('[v0] Error loading cart:', err)
      }
    }
  }, [])

  // Load cart from localStorage on mount
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError('দয়া করে সব তথ্য পূরণ করুন')
      return
    }

    if (cartItems.length === 0) {
      setError('কার্ট খালি আছে')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[v0] Initiating SSLCommerz payment...')
      
      const response = await fetch('/api/payment/sslcommerz/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getCartTotal(),
          provider: 'sslcommerz',
          cartItems: cartItems,
          customerInfo: customerInfo,
        }),
      })

      const data: SSLCommerz = await response.json()
      console.log('[v0] SSLCommerz response:', data)

      if (data.success && data.post_params) {
        // Create and submit form to SSLCommerz
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.sslcommerz_url

        Object.keys(data.post_params).forEach((key) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(data.post_params[key])
          form.appendChild(input)
        })

        document.body.appendChild(form)
        console.log('[v0] Submitting form to SSLCommerz...')
        form.submit()
      } else {
        setError(data.message || 'পেমেন্ট শুরু করতে ব্যর্থ')
      }
    } catch (err: any) {
      console.error('[v0] Payment error:', err)
      setError(err.message || 'একটি ত্রুটি ঘটেছে')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">নিরাপদ পেমেন্ট</h1>
          <p className="text-gray-600">SSLCommerz এর মাধ্যমে নিরাপদে অর্থপ্রেরণ করুন</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">গ্রাহকের তথ্য</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নাম *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="আপনার পুরো নাম"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ইমেইল *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">পেমেন্ট পদ্ধতি</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">SSLCommerz (নিরাপদ পেমেন্ট গেটওয়ে)</p>
                    <p className="text-sm text-blue-700">ক্রেডিট কার্ড, ডেবিট কার্ড, মোবাইল ব্যাংকিং ব্যবহার করুন</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    প্রক্রিয়া করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    SSLCommerz এ পেমেন্ট করুন
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                আপনার ব্যক্তিগত তথ্য সম্পূর্ণ নিরাপদ এবং এনক্রিপ্টেড থাকে
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">অর্ডার সারসংক্ষেপ</h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">কার্ট খালি আছে</p>
                  <button
                    onClick={() => router.push('/medicines')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    শপিং চালিয়ে যান
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">×{item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ৳{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-600">সাবটোটাল</p>
                      <p className="font-semibold text-gray-900">৳{getCartTotal().toFixed(0)}</p>
                    </div>
                    <div className="flex justify-between mb-4">
                      <p className="text-gray-600">ডেলিভারি</p>
                      <p className="font-semibold text-gray-900">ফ্রি</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <p className="text-lg font-bold text-gray-900">মোট</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ৳{getCartTotal().toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">
                      SSLCommerz sandbox এর মাধ্যমে নিরাপদে পেমেন্ট করুন
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
