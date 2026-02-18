'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'

export default function RegistrationSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            স্বাগতম!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            আপনার নিবন্ধন সফল হয়েছে
          </p>

          {/* Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-700 mb-2">
              <span className="font-semibold">পরবর্তী ধাপ:</span>
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>আপনার ইমেইল ব্যবহার করে লগইন করুন</li>
              <li>আপনার প্রোফাইল সম্পূর্ণ করুন</li>
              <li>সেবা যোগ করুন এবং শুরু করুন</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              হোম পেজে ফিরুন
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/provider-register')}
              className="w-full bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-all"
            >
              অন্য সেবা যোগ করুন
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500 mt-6">
            যদি কোনো সমস্যা হয়, সাপোর্ট দলের সাথে যোগাযোগ করুন
          </p>
        </div>
      </div>
    </div>
  )
}
