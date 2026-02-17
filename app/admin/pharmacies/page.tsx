"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Trash2, RefreshCw } from "lucide-react"

interface Pharmacy {
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

export default function PharmaciesListPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPharmacies = async () => {
    setLoading(true)

    const localPharmacies = JSON.parse(localStorage.getItem("shusto_pharmacies") || "[]")

    try {
      const response = await fetch("/api/pharmacies")
      const result = await response.json()
      if (result.pharmacies && result.pharmacies.length > 0) {
        // Merge API and local pharmacies
        const allPharmacies = [...result.pharmacies, ...localPharmacies]
        // Remove duplicates by email
        const uniquePharmacies = allPharmacies.filter(
          (p, index, self) => index === self.findIndex((t) => t.email === p.email),
        )
        setPharmacies(uniquePharmacies)
      } else {
        setPharmacies(localPharmacies)
      }
    } catch {
      // Fallback to localStorage only
      setPharmacies(localPharmacies)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const deletePharmacy = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ফার্মেসি মুছতে চান?")) return

    const localPharmacies = JSON.parse(localStorage.getItem("shusto_pharmacies") || "[]")
    const updatedPharmacies = localPharmacies.filter((p: Pharmacy) => p.id !== id)
    localStorage.setItem("shusto_pharmacies", JSON.stringify(updatedPharmacies))

    // Try API delete too
    try {
      await fetch(`/api/pharmacies?id=${id}`, { method: "DELETE" })
    } catch {
      // Ignore API errors
    }

    fetchPharmacies()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-8 pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>ফিরে যান</span>
        </Link>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">ফার্মেসির তালিকা</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchPharmacies}
              className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              রিফ্রেশ
            </button>
            <Link href="/admin/add-pharmacy" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              + নতুন ফার্মেসি
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">কোনো ফার্মেসি নেই</p>
            <Link href="/admin/add-pharmacy" className="text-teal-600 hover:underline">
              + নতুন ফার্মেসি যোগ করুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-500">{pharmacy.email}</p>
                      <p className="text-sm text-gray-500">{pharmacy.phone}</p>
                      {pharmacy.address && <p className="text-sm text-gray-400 mt-1">{pharmacy.address}</p>}
                      <p className="text-xs text-teal-600 mt-2">এই ইমেইল দিয়ে লগইন করলে Pharmacy Dashboard দেখা যাবে</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePharmacy(pharmacy.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
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
