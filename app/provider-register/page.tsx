'use client'

import { useRouter } from 'next/navigation'
import {
  Building2,
  Truck,
  Stethoscope,
  Pill,
  Dumbbell,
  ArrowRight,
} from 'lucide-react'

const providers = [
  {
    icon: Building2,
    title: 'হাসপাতাল',
    description: 'আপনার হাসপাতাল নিবন্ধন করুন এবং রোগীদের সাথে সংযুক্ত হন',
    path: '/hospital/register',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Truck,
    title: 'অ্যাম্বুলেন্স',
    description: 'জরুরি পরিবহন সেবা প্রদান করুন',
    path: '/ambulance/register',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    icon: Stethoscope,
    title: 'ল্যাবরেটরি',
    description: 'আপনার ল্যাব সেবা শেয়ার করুন',
    path: '/lab/register',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Pill,
    title: 'ফার্মেসি',
    description: 'ওষুধ বিক্রয় করুন এবং রোগীদের সেবা করুন',
    path: '/pharmacy/register',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Dumbbell,
    title: 'ফিজিওথেরাপি',
    description: 'ফিজিওথেরাপি সেবা প্রদান করুন',
    path: '/physio/register',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
]

export default function ProviderRegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">শুস্টো - হেলথকেয়ার প্রোভাইডার প্ল্যাটফর্ম</h1>
          <p className="text-lg text-indigo-100">
            আপনার হেলথকেয়ার সেবা বিশ্বব্যাপী রোগীদের কাছে পৌঁছাতে আজই নিবন্ধন করুন
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
          আপনার সেবা ধরন নির্বাচন করুন
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const Icon = provider.icon
            return (
              <div
                key={provider.path}
                className="group cursor-pointer"
                onClick={() => router.push(provider.path)}
              >
                <div className={`${provider.bgColor} rounded-2xl p-8 h-full transition-all hover:shadow-xl hover:scale-105`}>
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {provider.title}
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    {provider.description}
                  </p>

                  <button className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${provider.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}>
                    নিবন্ধন করুন
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-slate-900">
            শুস্টো-তে যোগ দেওয়ার সুবিধা
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">১০০%</div>
              <p className="text-slate-700">অনলাইন রেজিস্ট্রেশন - কোনো কাগজপত্র প্রয়োজন নেই</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">২৪/৭</div>
              <p className="text-slate-700">আপনার ড্যাশবোর্ড যেকোনো সময় অ্যাক্সেস করুন</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">সীমাহীন</div>
              <p className="text-slate-700">বিশ্বব্যাপী রোগীদের সাথে সংযুক্ত হন</p>
            </div>
          </div>
        </div>

        {/* Already Registered */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            ইতিমধ্যে নিবন্ধিত? আপনার ড্যাশবোর্ড অ্যাক্সেস করুন
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/hospital/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              হাসপাতাল ড্যাশবোর্ড
            </button>
            <button
              onClick={() => router.push('/pharmacy/orders')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              ফার্মেসি ড্যাশবোর্ড
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
