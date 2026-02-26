"use client"

import Link from "next/link"
import { useState } from "react"
import { PrescriptionUploadModal } from "./prescription-upload-modal"
import { Truck, Building2, Stethoscope, Activity, Heart } from "lucide-react"

export function HeroSection() {
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  const scrollToProducts = () => {
    const productsSection = document.querySelector(".mx-auto.px-2.pt-12.pb-16")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                ৫০,০০০+ গ্রাহকের বিশ্বস্ত
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                আপনার স্বাস্থ্য,
                <br />
                <span className="text-emerald-600">আপনার দোরগোড়ায়</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                অনলাইনে ওষুধ, চিকিৎসা যন্ত্র এবং স্বাস্থ্য পণ্য অর্ডার করুন। দ্রুত ডেলিভারি, খাঁটি পণ্য এবং ২৪/৭ বিশেষজ্ঞ পরামর্শ উপলব্ধ।
              </p>

              {/* Main CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/doctors"
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Stethoscope className="w-5 h-5" />
                  ডাক্তার পরামর্শ নিন
                </Link>
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="rounded-lg border-2 border-emerald-600 px-5 py-3 font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  প্রেসক্রিপশন আপলোড করুন
                </button>
                <Link
                  href="/medicines"
                  className="rounded-lg border-2 border-emerald-600 px-5 py-3 font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  ওষুধ ব্রাউজ করুন
                </Link>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <p className="text-sm font-semibold text-zinc-700 mb-3">জরুরি এবং বিশেষ সেবা:</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link
                    href="/ambulance"
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md"
                  >
                    <Truck className="w-5 h-5" />
                    জরুরি অ্যাম্বুলেন্স
                  </Link>
                  <Link
                    href="/hospitals"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <Building2 className="w-5 h-5" />
                    হাসপাতাল সেবা
                  </Link>
                  <Link
                    href="/physiotherapy"
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md"
                  >
                    <Activity className="w-5 h-5" />
                    ফিজিওথেরাপি
                  </Link>
                  <Link
                    href="/physiotherapy?tab=nursing"
                    className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors shadow-md"
                  >
                    <Heart className="w-5 h-5" />
                    নার্সিং সেবা
                  </Link>
                </div>

                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-sm font-semibold text-zinc-700 mb-3">প্রোভাইডার হিসেবে যোগ দিন:</p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/provider-register"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      নিবন্ধন করুন
                    </Link>
                    <Link
                      href="/provider-login"
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      লগইন করুন
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 md:gap-8 pt-4">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">২৪/৭</p>
                  <p className="text-xs md:text-sm text-gray-600">জরুরি সেবা</p>
                </div>
                <div className="h-10 md:h-12 w-px bg-gray-300" />
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">সুস্থ শরীরই</p>
                  <p className="text-xs md:text-sm text-gray-600">সবচেয়ে বড় সম্পদ</p>
                </div>
                <div className="h-10 md:h-12 w-px bg-gray-300" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">ফ্রি</p>
                  <p className="text-xs md:text-sm text-gray-600">৫০০৳ এর উপরে ডেলিভারি</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative h-[400px] w-full">
                <img
                  src="/pharmacy-medical-store-healthcare.jpg"
                  alt="ফার্মেসি"
                  className="h-full w-full rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPrescriptionModal && (
        <PrescriptionUploadModal
          onClose={() => setShowPrescriptionModal(false)}
          onUploadComplete={() => {
            setTimeout(scrollToProducts, 500)
          }}
        />
      )}
    </>
  )
}
