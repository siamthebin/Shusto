"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MapPin, Phone, Clock, Truck, CheckCircle } from "lucide-react"

function TrackingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<any>(null)
  const [currentEta, setCurrentEta] = useState(0)
  const [status, setStatus] = useState<"coming" | "arrived" | "completed">("coming")

  useEffect(() => {
    if (bookingId) {
      const bookings = JSON.parse(localStorage.getItem("shusto_ambulance_bookings") || "[]")
      const found = bookings.find((b: any) => b.id === bookingId)
      if (found) {
        setBooking(found)
        setCurrentEta(found.eta || 5)
      }
    }
  }, [bookingId])

  // Simulate ETA countdown
  useEffect(() => {
    if (currentEta > 0 && status === "coming") {
      const timer = setInterval(() => {
        setCurrentEta((prev) => {
          if (prev <= 1) {
            setStatus("arrived")
            return 0
          }
          return prev - 1
        })
      }, 60000) // Update every minute (for demo, change to 1000 for seconds)

      return () => clearInterval(timer)
    }
  }, [currentEta, status])

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-500">বুকিং তথ্য পাওয়া যায়নি</p>
          <button onClick={() => router.push("/ambulance")} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
            ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Map Placeholder */}
      <div className="h-[40vh] bg-gradient-to-br from-zinc-300 to-zinc-400 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Truck className="w-16 h-16 text-red-600 mx-auto mb-2 animate-bounce" />
            <p className="text-zinc-700 font-semibold">
              {status === "arrived" ? "অ্যাম্বুলেন্স পৌঁছে গেছে!" : "অ্যাম্বুলেন্স আসছে..."}
            </p>
          </div>
        </div>

        {/* Back button */}
        <button onClick={() => router.push("/")} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg">
          <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 p-6">
        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            status === "arrived" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status === "arrived" ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
          <span className="font-semibold">{status === "arrived" ? "পৌঁছে গেছে" : `${currentEta} মিনিটে পৌঁছাবে`}</span>
        </div>

        {/* Ambulance Info */}
        <div className="border border-zinc-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900">{booking.ambulanceName}</h3>
              <p className="text-zinc-500">{booking.vehicleNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">ড্রাইভার</p>
                <p className="font-semibold text-zinc-900">{booking.driverName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-xs text-zinc-500">পিকআপ লোকেশন</p>
              <p className="font-semibold text-zinc-900">{booking.pickupLocation}</p>
            </div>
          </div>

          <div className="ml-4 border-l-2 border-dashed border-zinc-300 h-6"></div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">গন্তব্য</p>
              <p className="font-semibold text-zinc-900">{booking.destination}</p>
            </div>
          </div>
        </div>

        {/* Fare Info */}
        <div className="bg-zinc-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">মোট ভাড়া</span>
            <span className="font-bold text-xl text-zinc-900">৳{booking.fare}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">বেস ভাড়া + {booking.estimatedDistance} কিমি</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a
            href={`tel:${booking.phone}`}
            className="flex-1 py-4 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-center flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            কল করুন
          </a>
          <button
            onClick={() => {
              // Cancel booking
              const bookings = JSON.parse(localStorage.getItem("shusto_ambulance_bookings") || "[]")
              const updated = bookings.filter((b: any) => b.id !== bookingId)
              localStorage.setItem("shusto_ambulance_bookings", JSON.stringify(updated))
              router.push("/")
            }}
            className="flex-1 py-4 bg-zinc-200 text-zinc-700 rounded-xl font-semibold"
          >
            বাতিল করুন
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AmbulanceTracking() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  )
}
