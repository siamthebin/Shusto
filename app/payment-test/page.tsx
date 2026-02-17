'use client'

import { useState } from 'react'
import { CreditCard, Copy, CheckCircle, AlertCircle } from 'lucide-react'

export default function PaymentTestPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const testCards = [
    {
      name: 'Visa Test Card',
      number: '4111111111111111',
      expiry: 'Any future date',
      cvv: 'Any 3 digits',
      description: 'All transactions will be successful'
    },
    {
      name: 'MasterCard Test Card',
      number: '5555555555554444',
      expiry: 'Any future date',
      cvv: 'Any 3 digits',
      description: 'All transactions will be successful'
    },
    {
      name: 'AMEX Test Card',
      number: '378282246310005',
      expiry: 'Any future date',
      cvv: 'Any 4 digits',
      description: 'All transactions will be successful'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SSLCommerz Payment Testing</h1>
          <p className="text-gray-600">Sandbox Mode - Test the payment integration safely</p>
        </div>

        {/* Credentials Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sandbox Credentials</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Store ID</label>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <code className="text-sm font-mono text-gray-900">shust6992a1e590b0e</code>
                <button
                  onClick={() => copyToClipboard('shust6992a1e590b0e', 'Store ID')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied === 'Store ID' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Password</label>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <code className="text-sm font-mono text-gray-900">shust6992a1e590b0e@ssl</code>
                <button
                  onClick={() => copyToClipboard('shust6992a1e590b0e@ssl', 'Password')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied === 'Password' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cards Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Card Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCards.map((card, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{card.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 bg-gray-50 p-3 rounded">
                  <div>
                    <p className="text-xs text-gray-600">Card Number</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-900">{card.number}</code>
                      <button
                        onClick={() => copyToClipboard(card.number, `Card ${idx}`)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Expiry</p>
                      <p className="text-sm text-gray-900">{card.expiry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">CVV</p>
                      <p className="text-sm text-gray-900">{card.cvv}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testing Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Test</h2>
          <ol className="space-y-4">
            {[
              { step: 1, title: 'Add items to cart', desc: 'Go to medicines/products and add items to cart' },
              { step: 2, title: 'Click Checkout', desc: 'Open cart drawer and click checkout button' },
              { step: 3, title: 'Select SSLCommerz', desc: 'Choose SSLCommerz as payment method' },
              { step: 4, title: 'Enter customer details', desc: 'Fill in name, email, and phone number' },
              { step: 5, title: 'Proceed to payment', desc: 'Click "SSLCommerz এ পেমেন্ট করুন" button' },
              { step: 6, title: 'Use test card', desc: 'Enter any test card number from above' },
              { step: 7, title: 'Confirm payment', desc: 'Follow the payment gateway instructions' },
              { step: 8, title: 'Success page', desc: 'You will be redirected to success page with transaction details' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </ol>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• This is Sandbox mode - no real money will be charged</li>
                <li>• All test card transactions will be marked as successful</li>
                <li>• Use any expiry date in the future (e.g., 12/25)</li>
                <li>• Use any 3-4 digit CVV number</li>
                <li>• All transactions are stored in database for tracking</li>
                <li>• Wallet balance will be updated only in database, not in real account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Home
          </a>
          <a
            href="/medicines"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Test Medicines →
          </a>
        </div>
      </div>
    </div>
  )
}
