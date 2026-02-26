"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FlaskConical, Trash2, RefreshCw } from "lucide-react"

interface Lab {
  id: string
  name: string
  email: string
  phone: string
  address: string
  license_number: string
  owner_name: string
  services: string[]
  status: string
  created_at: string
}

export default function LabsListPage() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLabs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/labs")
      const result = await response.json()
      console.log("[v0] labs API response:", result)
      if (result.labs) {
        setLabs(result.labs)
      }
    } catch (err) {
      console.error("[v0] Error fetching labs:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLabs()
  }, [])

  const deleteLab = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ল্যাব মুছতে চান?")) return
    try {
      await fetch(`/api/admin/labs?id=${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("[v0] Error deleting lab:", err)
    }
    fetchLabs()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8 pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>ফিরে যান</span>
        </Link>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">ল্যাবের তালিকা</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchLabs}
              className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              রিফ্রেশ
            </button>
            <Link href="/admin/add-lab" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              + নতুন ল্যাব
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : labs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">কোনো ল্যাব নেই</p>
            <Link href="/admin/add-lab" className="text-indigo-600 hover:underline">
              + নতুন ল্যাব যোগ করুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{lab.name}</h3>
                      <p className="text-sm text-gray-500">{lab.email}</p>
                      <p className="text-sm text-gray-500">{lab.phone}</p>
                      {lab.address && <p className="text-sm text-gray-400 mt-1">{lab.address}</p>}
                      {lab.services && lab.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lab.services.map((service, index) => (
                            <span key={index} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-indigo-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Lab Dashboard দেখা যাবে</p>
                    </div>
                  </div>
                  <button onClick={() => deleteLab(lab.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
