"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, Trash2, MapPin, Phone, ArrowLeft, RefreshCw, Pause, Play } from "lucide-react"

interface Hospital {
  id: string
  name: string
  email: string
  phone: string
  address: string
  license_number: string
  owner_name: string
  status: string
  created_at: string
}

export default function HospitalsListPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/hospitals")
      const result = await response.json()
      console.log("[v0] hospitals API response:", result)
      if (result.hospitals) {
        setHospitals(result.hospitals)
      }
    } catch (err) {
      console.error("[v0] Error fetching hospitals:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  const deleteHospital = async (id: string) => {
    if (!confirm("এই হাসপাতাল মুছে ফেলতে চান?")) return
    try {
      await fetch(`/api/admin/hospitals?id=${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("[v0] Error deleting hospital:", err)
    }
    fetchHospitals()
  }

  const togglePauseHospital = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/toggle-hospital-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: id, isPaused: !currentStatus }),
      })

      if (response.ok) {
        fetchHospitals()
      }
    } catch (error) {
      console.error("Error toggling pause status:", error)
      alert("সেবা অবস্থা পরিবর্তন করতে ব্যর্থ হয়েছে")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">হাসপাতালের তালিকা</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchHospitals}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
            >
              <RefreshCw className="w-5 h-5" />
              রিফ্রেশ
            </button>
            <button
              onClick={() => router.push("/admin/add-hospital")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              নতুন হাসপাতাল
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">কোনো হাসপাতাল যোগ করা হয়নি</p>
          </div>
        ) : (
          hospitals.map((hospital) => (
            <div key={hospital.id} className={`bg-white rounded-xl p-4 shadow-sm border ${hospital.is_paused ? "border-red-300 bg-red-50" : "border-zinc-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hospital.is_paused ? "bg-red-100" : "bg-blue-100"}`}>
                    <Building2 className={`w-6 h-6 ${hospital.is_paused ? "text-red-600" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900">{hospital.name}</h3>
                      {hospital.is_paused && (
                        <span className="text-xs px-2 py-0.5 bg-red-200 text-red-700 rounded-full font-semibold">পজ রয়েছে</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{hospital.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePauseHospital(hospital.id, hospital.is_paused || false)}
                    className={`p-2 rounded-lg transition-colors ${hospital.is_paused ? "text-green-600 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50"}`}
                  >
                    {hospital.is_paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteHospital(hospital.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {hospital.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {hospital.address}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Hospital Dashboard দেখা যাবে</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
