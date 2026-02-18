'use client'

import { AlertCircle, CreditCard, Smartphone, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function WalletPaymentTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4">
        <div className="max-w-lg mx-auto">
          <Link href="/wallet" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ফিরে যান
          </Link>
          <h1 className="text-2xl font-bold">ওয়ালেট পেমেন্ট টেস্ট গাইড</h1>
          <p className="text-white/80 text-sm mt-1">SSLCommerz Sandbox পেমেন্ট পদ্ধতি</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Step 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
            <h2 className="text-lg font-bold text-zinc-900">টাকা যোগ করুন বাটনে ক্লিক করুন</h2>
          </div>
          <p className="text-sm text-zinc-600 ml-13">আপনার ওয়ালেট পেজে "টাকা যোগ করুন (কার্ড/ব্যাংক)" বাটনে ক্লিক করুন।</p>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">2</div>
            <h2 className="text-lg font-bold text-zinc-900">পরিমাণ নির্বাচন করুন</h2>
          </div>
          <p className="text-sm text-zinc-600 ml-13">কত টাকা যোগ করতে চান তা লিখুন। ন্যূনতম ১০ টাকা।</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 ml-13">
            <p className="text-xs text-emerald-700">দ্রুত অপশন: ১০০, ৫০০, ১০০০, ২০০০ টাকা</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">3</div>
            <h2 className="text-lg font-bold text-zinc-900">পেমেন্ট মেথড নির্বাচন</h2>
          </div>
          <p className="text-sm text-zinc-600 ml-13">নীল বাটন "কার্ড/ব্যাংক" এ ক্লিক করুন। এটি SSLCommerz gateway ব্যবহার করে।</p>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">4</div>
            <h2 className="text-lg font-bold text-zinc-900">পেমেন্ট করুন বাটনে ক্লিক</h2>
          </div>
          <p className="text-sm text-zinc-600 ml-13">নীল "পেমেন্ট করুন" বাটনে ক্লিক করুন। SSLCommerz পেমেন্ট পেজে যাবে।</p>
        </div>

        {/* Test Card Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-zinc-900">Test Card Information</h2>
          </div>

          <div className="space-y-3">
            {/* Visa */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-blue-900">Visa Card</p>
              <div className="space-y-1">
                <p className="text-xs text-blue-800"><strong>নম্বর:</strong> 4111111111111111</p>
                <p className="text-xs text-blue-800"><strong>Expiry:</strong> যেকোনো ভবিষ্যত তারিখ (e.g., 12/25)</p>
                <p className="text-xs text-blue-800"><strong>CVV:</strong> যেকোনো 3 সংখ্যা (e.g., 123)</p>
              </div>
            </div>

            {/* MasterCard */}
            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-red-900">MasterCard</p>
              <div className="space-y-1">
                <p className="text-xs text-red-800"><strong>নম্বর:</strong> 5555555555554444</p>
                <p className="text-xs text-red-800"><strong>Expiry:</strong> যেকোনো ভবিষ্যত তারিখ (e.g., 12/25)</p>
                <p className="text-xs text-red-800"><strong>CVV:</strong> যেকোনো 3 সংখ্যা (e.g., 123)</p>
              </div>
            </div>

            {/* AMEX */}
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-green-900">American Express</p>
              <div className="space-y-1">
                <p className="text-xs text-green-800"><strong>নম্বর:</strong> 378282246310005</p>
                <p className="text-xs text-green-800"><strong>Expiry:</strong> যেকোনো ভবিষ্যত তারিখ (e.g., 12/25)</p>
                <p className="text-xs text-green-800"><strong>CVV:</strong> যেকোনো 4 সংখ্যা (e.g., 1234)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">গুরুত্বপূর্ণ নোট</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>এটি SSLCommerz Sandbox (Test) মোড</li>
                <li>সব test card দিয়ে successful পেমেন্ট হবে</li>
                <li>কোনো বাস্তব টাকা কাটা হবে না</li>
                <li>Test পেমেন্ট সফল হলে আপনার ওয়ালেটে ব্যালেন্স যুক্ত হবে</li>
                <li>Production mode এ হলে সত্যিকারের টাকা কাটা যাবে</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Information */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-900 mb-2">পেমেন্ট সফল হলে</h3>
              <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                <li>আপনি Success page এ পাবেন</li>
                <li>আপনার ওয়ালেট ব্যালেন্স তাৎক্ষণিক আপডেট হবে</li>
                <li>Transaction history এ entry যোগ হবে</li>
                <li>এখন আপনি wallet balance দিয়ে কেনাকাটা করতে পারবেন</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Go to Wallet Button */}
        <Link href="/wallet">
          <button className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-emerald-700 transition-all">
            ওয়ালেটে যান এবং টেস্ট করুন
          </button>
        </Link>
      </div>
    </div>
  )
}
