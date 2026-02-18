"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, Plus, Trash2, RefreshCw } from "lucide-react"

interface Physio {
  id: string
  name: string
  email: string
  phone: string
  address: string
  specialization: string
  experience_years: string
  services: { name: string; price: number; duration: string }[]
  status: string
  rating: number
  created_at: string
}

export default function PhysiosListPage() {
  const router = useRouter()
  const [physios, setPhysios] = useState<Physio[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhysios = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/physios")
      const result = await response.json()
      console.log("[v0] physios API response:", result)
      if (result.physios) {
        setPhysios(result.physios)
      }
    } catch (err) {
      console.error("[v0] Error fetching physios:", err)
    }
    setLoading(false)
  }

  const loadPhysios = async () => {
    await fetchPhysios()
  }

  useEffect(() => {
    fetchPhysios()
  }, [])

  const deletePhysio = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ফিজিও/নার্স মুছে ফেলতে চান?")) return
    try {
      await fetch(`/api/admin/physios?id=${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("[v0] Error deleting physio:", err)
    }
    fetchPhysios()
  }

  const getSpecializationLabel = (spec: string) => {
    const labels: { [key: string]: string } = {
      physiotherapy: "ফিজিওথেরাপি",
      nursing: "নার্সিং কেয়ার",
      elderly_care: "বয়স্ক সেবা",
      post_surgery: "পোস্ট সার্জারি কেয়ার",
      stroke_rehab: "স্ট্রোক রিহ্যাবিলিটেশন",
    }
    return labels[spec] || spec
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <h1 className="text-2xl font-bold">ফিজিও ও নার্সিং তালিকা</h1>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={fetchPhysios}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-zinc-700"
          >
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </button>
          <Link
            href="/admin/add-physio"
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold"
          >
            <Plus className="w-4 h-4" />
            নতুন যোগ করুন
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        ) : physios.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl">
            <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <p className="text-zinc-500">কোনো ফিজিও/নার্স নেই</p>
            <Link href="/admin/add-physio" className="text-pink-500 font-semibold mt-2 inline-block">
              + নতুন যোগ করুন
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {physios.map((physio) => (
              <div key={physio.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{physio.name}</h3>
                      <p className="text-sm text-zinc-500">{physio.email}</p>
                      <p className="text-xs text-zinc-400">{physio.phone}</p>
                      <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                        {getSpecializationLabel(physio.specialization)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePhysio(physio.id)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-pink-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Physio Dashboard দেখা যাবে</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
