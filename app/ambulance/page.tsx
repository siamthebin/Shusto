"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Phone, Clock, Truck, Navigation, AlertCircle } from "lucide-react"
import BottomNav from "@/components/kokonutui/bottom-nav"

interface Ambulance {
  id: string
  name: string
  type: "basic" | "icu" | "nicu"
  phone: string
  driverName: string
  vehicleNumber: string
  latitude: number
  longitude: number
  pricePerKm: number
  baseFare: number
  available: boolean
  rating: number
  distance?: number
  eta?: number
}

// Sample ambulances
const sampleAmbulances: Ambulance[] = [
  {
    id: "amb1",
    name: "লাইফ সেভার অ্যাম্বুলেন্স",
    type: "icu",
    phone: "01700-000001",
    driverName: "করিম উদ্দিন",
    vehicleNumber: "ঢাকা মেট্রো-ক-১২৩৪",
    latitude: 23.7925,
    longitude: 90.4042,
    pricePerKm: 30,
    baseFare: 500,
    available: true,
    rating: 4.8,
  },
  {
    id: "amb2",
    name: "ইমার্জেন্সি কেয়ার",
    type: "basic",
    phone: "01700-000002",
    driverName: "রহিম মিয়া",
    vehicleNumber: "ঢাকা মেট্রো-খ-৫৬৭৮",
    latitude: 23.7515,
    longitude: 90.397,
    pricePerKm: 20,
    baseFare: 300,
    available: true,
    rating: 4.5,
  },
  {
    id: "amb3",
    name: "মেডি-ট্রান্সপোর্ট",
    type: "nicu",
    phone: "01700-000003",
    driverName: "আলী হোসেন",
    vehicleNumber: "ঢাকা মেট্রো-গ-৯০১২",
    latitude: 23.8103,
    longitude: 90.4225,
    pricePerKm: 50,
    baseFare: 1000,
    available: true,
    rating: 4.9,
  },
]

export default function AmbulancePage() {
  const router = useRouter()
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(true)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [estimatedDistance, setEstimatedDistance] = useState(5) // Default 5km

  useEffect(() => {
    getCurrentLocation()
    loadAmbulances()
  }, [])

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Reverse geocoding (simplified - in production use Google Maps API)
          const address = "আপনার বর্তমান অবস্থান"

          setUserLocation({ lat, lng, address })
          setGettingLocation(false)
        },
        () => {
          setUserLocation({ lat: 23.8103, lng: 90.4125, address: "ঢাকা, বাংলাদেশ" })
          setGettingLocation(false)
        },
      )
    }
  }

  const loadAmbulances = () => {
    const savedAmbulances = localStorage.getItem("shusto_ambulances")
    if (savedAmbulances) {
      setAmbulances([...sampleAmbulances, ...JSON.parse(savedAmbulances)])
    } else {
      setAmbulances(sampleAmbulances)
    }
    setLoading(false)
  }

  // Calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Sort ambulances by distance
  const sortedAmbulances = ambulances
    .map((amb) => {
      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, amb.latitude, amb.longitude)
        : 0
      return {
        ...amb,
        distance,
        eta: Math.ceil(distance * 3), // ~3 min per km
      }
    })
    .filter((a) => a.available)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))

  const handleBookAmbulance = (ambulance: Ambulance) => {
    setSelectedAmbulance(ambulance)
    setShowBookingModal(true)
  }

  const calculateFare = (ambulance: Ambulance) => {
    return ambulance.baseFare + ambulance.pricePerKm * estimatedDistance
  }

  const confirmBooking = () => {
    if (!selectedAmbulance || !userLocation) return

    const fare = calculateFare(selectedAmbulance)
    const booking = {
      id: `AMB-${Date.now()}`,
      ambulanceId: selectedAmbulance.id,
      ambulanceName: selectedAmbulance.name,
      driverName: selectedAmbulance.driverName,
      vehicleNumber: selectedAmbulance.vehicleNumber,
      phone: selectedAmbulance.phone,
      pickupLocation: userLocation.address,
      destination: destination || "জরুরি গন্তব্য",
      estimatedDistance,
      fare,
      // Revenue sharing: Provider 70%, Shusto 30%
      providerShare: fare * 0.7,
      shustoShare: fare * 0.3,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
      eta: selectedAmbulance.eta,
    }

    // Save booking
    const existingBookings = JSON.parse(localStorage.getItem("shusto_ambulance_bookings") || "[]")
    localStorage.setItem("shusto_ambulance_bookings", JSON.stringify([booking, ...existingBookings]))

    alert(
      `অ্যাম্বুলেন্স বুক হয়েছে!\n\nবুকিং আইডি: ${booking.id}\nড্রাইভার: ${booking.driverName}\nফোন: ${booking.phone}\nআনুমানিক সময়: ${booking.eta} মিনিট\nভাড়া: ৳${fare}`,
    )

    setShowBookingModal(false)
    setSelectedAmbulance(null)

    // Redirect to tracking
    router.push(`/ambulance/tracking?bookingId=${booking.id}`)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "basic":
        return "বেসিক"
      case "icu":
        return "ICU"
      case "nicu":
        return "NICU"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "basic":
        return "bg-green-100 text-green-700"
      case "icu":
        return "bg-red-100 text-red-700"
      case "nicu":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-zinc-100 text-zinc-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ফিরে যান
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">জরুরি অ্যাম্বুলেন্স</h1>
            <p className="text-red-100 text-sm">নিকটতম অ্যাম্বুলেন্স খুঁজুন</p>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/70">পিকআপ লোকেশন</p>
              <p className="font-semibold">{userLocation?.address || "লোকেশন লোড হচ্ছে..."}</p>
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
            >
              <Navigation className={`w-5 h-5 ${gettingLocation ? "animate-spin" : ""}`} />
            </button>
          </div>
          <input
            type="text"
            placeholder="গন্তব্য লিখুন (ঐচ্ছিক)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 rounded-lg placeholder-white/50 text-white border border-white/30 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Distance Slider */}
      <div className="px-4 py-4 bg-white border-b">
        <label className="block text-sm font-semibold text-zinc-700 mb-2">আনুমানিক দূরত্ব: {estimatedDistance} কিমি</label>
        <input
          type="range"
          min="1"
          max="50"
          value={estimatedDistance}
          onChange={(e) => setEstimatedDistance(Number(e.target.value))}
          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>১ কিমি</span>
          <span>৫০ কিমি</span>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">জরুরি হেল্পলাইন</p>
          <p className="text-sm text-red-700">999 (জাতীয় জরুরি সেবা) | 16263 (স্বাস্থ্য হেল্পলাইন)</p>
        </div>
      </div>

      {/* Ambulance List */}
      <div className="px-4 py-4 space-y-4">
        <h2 className="font-bold text-lg text-zinc-900">নিকটতম অ্যাম্বুলেন্স ({sortedAmbulances.length}টি)</h2>

        {sortedAmbulances.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">কোনো অ্যাম্বুলেন্স উপলব্ধ নেই</p>
          </div>
        ) : (
          sortedAmbulances.map((ambulance) => (
            <div key={ambulance.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-zinc-900">{ambulance.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getTypeColor(ambulance.type)}`}>
                      {getTypeLabel(ambulance.type)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{ambulance.vehicleNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">৳{calculateFare(ambulance)}</p>
                  <p className="text-xs text-zinc-500">আনুমানিক ভাড়া</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{ambulance.distance?.toFixed(1)} কিমি দূরে</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{ambulance.eta} মিনিট</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{ambulance.rating}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${ambulance.phone}`}
                  className="flex-1 py-3 border border-red-600 text-red-600 rounded-xl font-semibold text-center hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  কল করুন
                </a>
                <button
                  onClick={() => handleBookAmbulance(ambulance)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                >
                  বুক করুন
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedAmbulance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">বুকিং নিশ্চিত করুন</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-600">অ্যাম্বুলেন্স:</span>
                <span className="font-semibold">{selectedAmbulance.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">ড্রাইভার:</span>
                <span className="font-semibold">{selectedAmbulance.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">গাড়ি নম্বর:</span>
                <span className="font-semibold">{selectedAmbulance.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">আনুমানিক সময়:</span>
                <span className="font-semibold">{selectedAmbulance.eta} মিনিট</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">মোট ভাড়া:</span>
                <span className="font-bold text-red-600">৳{calculateFare(selectedAmbulance)}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-zinc-500">
                  * ড্রাইভার পাবে: ৳{(calculateFare(selectedAmbulance) * 0.7).toFixed(0)} (70%)
                  <br />* Shusto ফি: ৳{(calculateFare(selectedAmbulance) * 0.3).toFixed(0)} (30%)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 border border-zinc-300 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                বাতিল
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
