"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Phone, Bed, Search, Star } from "lucide-react"
import BottomNav from "@/components/kokonutui/bottom-nav"

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  email: string
  latitude: number
  longitude: number
  services: Service[]
  rating: number
  distance?: number
}

interface Service {
  id: string
  name: string
  type: "bed" | "icu" | "cabin" | "operation"
  price: number
  available: number
  total: number
}

// Sample hospitals data (will be from database later)
const sampleHospitals: Hospital[] = [
  {
    id: "1",
    name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    address: "শাহবাগ, ঢাকা-১০০০",
    phone: "02-55165088",
    email: "info@dmch.gov.bd",
    latitude: 23.738,
    longitude: 90.3978,
    rating: 4.2,
    services: [
      { id: "s1", name: "জেনারেল বেড", type: "bed", price: 500, available: 25, total: 100 },
      { id: "s2", name: "ICU বেড", type: "icu", price: 5000, available: 5, total: 20 },
      { id: "s3", name: "কেবিন (AC)", type: "cabin", price: 3000, available: 8, total: 30 },
    ],
  },
  {
    id: "2",
    name: "স্কয়ার হাসপাতাল",
    address: "পান্থপথ, ঢাকা-১২০৫",
    phone: "02-8159457",
    email: "info@squarehospital.com",
    latitude: 23.7515,
    longitude: 90.387,
    rating: 4.7,
    services: [
      { id: "s4", name: "প্রাইভেট রুম", type: "cabin", price: 8000, available: 12, total: 50 },
      { id: "s5", name: "ICU বেড", type: "icu", price: 15000, available: 3, total: 15 },
      { id: "s6", name: "CCU বেড", type: "icu", price: 12000, available: 4, total: 10 },
    ],
  },
  {
    id: "3",
    name: "ইউনাইটেড হাসপাতাল",
    address: "গুলশান-২, ঢাকা-১২১২",
    phone: "02-8836000",
    email: "info@uhlbd.com",
    latitude: 23.7925,
    longitude: 90.4142,
    rating: 4.5,
    services: [
      { id: "s7", name: "ডিলাক্স কেবিন", type: "cabin", price: 10000, available: 6, total: 25 },
      { id: "s8", name: "ICU", type: "icu", price: 18000, available: 2, total: 12 },
      { id: "s9", name: "NICU", type: "icu", price: 20000, available: 3, total: 8 },
    ],
  },
]

export default function HospitalsPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedService, setSelectedService] = useState<{ hospital: Hospital; service: Service } | null>(null)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Default to Dhaka if location denied
          setUserLocation({ lat: 23.8103, lng: 90.4125 })
        },
      )
    }

    // Fetch hospitals from database
    const fetchHospitals = async () => {
      try {
        console.log("[v0] Fetching hospitals from API...")
        const response = await fetch("/api/admin/hospitals")
        const data = await response.json()
        console.log("[v0] Hospitals received:", data.hospitals?.length || 0)
        
        // Transform DB hospitals to match Service interface
        const dbHospitals = data.hospitals?.map((h: any) => ({
          id: h.id,
          name: h.name,
          address: h.address || "ঢাকা",
          phone: h.phone,
          email: h.email,
          latitude: h.latitude || 23.8103,
          longitude: h.longitude || 90.4125,
          rating: 4.5,
          services: [
            { id: `s1-${h.id}`, name: "জেনারেল বেড", type: "bed", price: 500, available: 10, total: 50 },
            { id: `s2-${h.id}`, name: "ICU বেড", type: "icu", price: 5000, available: 5, total: 20 },
            { id: `s3-${h.id}`, name: "কেবিন", type: "cabin", price: 3000, available: 8, total: 30 },
          ]
        })) || []
        
        setHospitals([...sampleHospitals, ...dbHospitals])
        setLoading(false)
      } catch (err) {
        console.error("[v0] Error fetching hospitals:", err)
        setHospitals(sampleHospitals)
        setLoading(false)
      }
    }

    fetchHospitals()
    
    // Re-fetch every 15 seconds for real-time updates
    const interval = setInterval(fetchHospitals, 15000)
    return () => clearInterval(interval)
  }, [])

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Sort hospitals by distance
  const sortedHospitals = hospitals
    .map((h) => ({
      ...h,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, h.latitude, h.longitude) : 0,
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))

  // Filter hospitals
  const filteredHospitals = sortedHospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedType === "all") return matchesSearch
    return matchesSearch && h.services.some((s) => s.type === selectedType && s.available > 0)
  })

  const handleBookService = (hospital: Hospital, service: Service) => {
    setSelectedService({ hospital, service })
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    if (!selectedService) return

    const booking = {
      id: `HOSP-${Date.now()}`,
      hospitalId: selectedService.hospital.id,
      hospitalName: selectedService.hospital.name,
      serviceName: selectedService.service.name,
      serviceType: selectedService.service.type,
      price: selectedService.service.price,
      // Revenue sharing: Hospital 60%, Shusto 40%
      hospitalShare: selectedService.service.price * 0.6,
      shustoShare: selectedService.service.price * 0.4,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    }

    // Save booking
    const existingBookings = JSON.parse(localStorage.getItem("shusto_hospital_bookings") || "[]")
    localStorage.setItem("shusto_hospital_bookings", JSON.stringify([booking, ...existingBookings]))

    alert(
      `বুকিং সফল!\n\nবুকিং আইডি: ${booking.id}\nহাসপাতাল: ${booking.hospitalName}\nসেবা: ${booking.serviceName}\nমূল্য: ৳${booking.price}`,
    )

    setShowBookingModal(false)
    setSelectedService(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ফিরে যান
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">হাসপাতাল সেবা</h1>
            <p className="text-blue-100 text-sm">বেড/ICU বুকিং করুন</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="হাসপাতাল খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "সব" },
            { id: "bed", label: "জেনারেল বেড" },
            { id: "icu", label: "ICU/CCU" },
            { id: "cabin", label: "কেবিন" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital List */}
      <div className="px-4 py-4 space-y-4">
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-12">
            <Bed className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">কোনো হাসপাতাল পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              {/* Hospital Info */}
              <div className="p-4 border-b border-zinc-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-zinc-900">{hospital.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700">{hospital.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{hospital.address}</span>
                  {hospital.distance && (
                    <span className="text-blue-600 font-semibold">({hospital.distance.toFixed(1)} km)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{hospital.phone}</span>
                </div>
              </div>

              {/* Services */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-zinc-700 mb-3">উপলব্ধ সেবা:</h4>
                <div className="space-y-2">
                  {hospital.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                      <div>
                        <p className="font-medium text-zinc-900">{service.name}</p>
                        <p className="text-sm text-zinc-500">
                          {service.available}/{service.total} উপলব্ধ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">৳{service.price}/দিন</p>
                        <button
                          onClick={() => handleBookService(hospital, service)}
                          disabled={service.available === 0}
                          className={`mt-1 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            service.available > 0
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                          }`}
                        >
                          {service.available > 0 ? "বুক করুন" : "শেষ"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">বুকিং নিশ্চিত করুন</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-600">হাসপাতাল:</span>
                <span className="font-semibold">{selectedService.hospital.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">সেবা:</span>
                <span className="font-semibold">{selectedService.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">মূল্য (প্রতিদিন):</span>
                <span className="font-bold text-blue-600">৳{selectedService.service.price}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-zinc-500">
                  * হাসপাতাল পাবে: ৳{(selectedService.service.price * 0.6).toFixed(0)} (60%)
                  <br />* Shusto ফি: ৳{(selectedService.service.price * 0.4).toFixed(0)} (40%)
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
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
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
