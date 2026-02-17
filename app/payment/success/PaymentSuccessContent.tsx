'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Home, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading')
  const [amount, setAmount] = useState('')
  const [tranId, setTranId] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    const statusParam = searchParams.get('status')
    const amountParam = searchParams.get('amount')
    const tranIdParam = searchParams.get('tran_id')
    const reasonParam = searchParams.get('reason')

    if (statusParam === 'success') {
      setStatus('success')
      setAmount(amountParam || '')
      setTranId(tranIdParam || '')
    } else {
      setStatus('failed')
      setReason(reasonParam || 'অজানা ত্রুটি')
    }
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {status === 'success' ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">পেমেন্ট সফল!</h1>
              <p className="text-gray-600 mt-2">আপনার অর্থপ্রেরণ সফলভাবে সম্পন্ন হয়েছে</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">লেনদেন আইডি</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{tranId}</p>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <p className="text-gray-600">পরিমাণ</p>
                <p className="text-xl font-bold text-green-600">৳{amount}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-600">
                  ⏰ সময় {new Date().toLocaleString('bn-BD')}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                আপনার ওয়ালেট আপডেট হয়েছে। এখন আপনি মেডিকেল সেবা বুক করতে পারবেন।
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-5 h-5" />
                হোমে ফিরুন
              </Link>
              <Link
                href="/providers"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                সেবা বুক করুন
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন: support@shusto.com
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">পেমেন্ট ব্যর্থ</h1>
              <p className="text-gray-600 mt-2">দুর্ভাগ্যবশত আপনার পেমেন্ট সফল হয়নি</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>কারণ:</strong> {
                  reason === 'invalid' ? 'অবৈধ লেনদেন'
                  : reason === 'timeout' ? 'সময়সীমা অতিক্রম'
                  : 'প্রযুক্তিগত ত্রুটি'
                }
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                আবার চেষ্টা করুন
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-5 h-5" />
                হোমে ফিরুন
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              সাহায্য প্রয়োজন? support@shusto.com এ ইমেইল করুন
            </p>
          </>
        )}
      </div>
    </div>
  )
}
