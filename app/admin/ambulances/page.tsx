"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck, Plus, Trash2, Phone, ArrowLeft, RefreshCw } from "lucide-react"

interface Ambulance {
  id: string
  name: string
  email: string
  phone: string
  vehicleNumber: string
  type: string
  driverName: string
  address: string
  status: string
  created_at: string
}

export default function AmbulancesListPage() {
  const router = useRouter()
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAmbulances = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/ambulances")
      const result = await response.json()
      console.log("[v0] ambulances API response:", result)
      if (result.ambulances) {
        setAmbulances(result.ambulances)
      }
    } catch (err) {
      console.error("[v0] Error fetching ambulances:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAmbulances()
  }, [])

  const deleteAmbulance = async (id: string) => {
    if (!confirm("এই অ্যাম্বুলেন্স মুছে ফেলতে চান?")) return
    try {
      await fetch(`/api/admin/ambulances?id=${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("[v0] Error deleting ambulance:", err)
    }
    fetchAmbulances()
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

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">অ্যাম্বুলেন্সের তালিকা</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchAmbulances}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50"
            >
              <RefreshCw className="w-5 h-5" />
              রিফ্রেশ
            </button>
            <button
              onClick={() => router.push("/admin/add-ambulance")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              নতুন অ্যাম্বুলেন্স
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : ambulances.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">কোনো অ্যাম্বুলেন্স যোগ করা হয়নি</p>
          </div>
        ) : (
          ambulances.map((ambulance) => (
            <div key={ambulance.id} className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900">{ambulance.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                        {getTypeLabel(ambulance.type)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{ambulance.vehicleNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteAmbulance(ambulance.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {ambulance.phone}
                </span>
                <span>ড্রাইভার: {ambulance.driverName}</span>
              </div>
              <p className="text-xs text-red-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Ambulance Dashboard দেখা যাবে</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
