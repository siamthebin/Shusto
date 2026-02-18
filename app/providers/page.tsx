"use client"

import { useEffect, useState } from "react"
import { Phone, MapPin, Star, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Provider {
  id: string
  name: string
  email: string
  phone: string
  address: string
  type: "hospital" | "ambulance" | "physio" | "lab"
  rating?: number
  is_active?: boolean
  is_available?: boolean
  specialty?: string
  services?: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "hospital" | "ambulance" | "physio" | "lab">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAllProviders()
    // Real-time update every 10 seconds
    const interval = setInterval(fetchAllProviders, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Filter providers by tab and search term
    let filtered = providers

    if (activeTab !== "all") {
      filtered = filtered.filter((p) => p.type === activeTab && p.is_active !== false)
    } else {
      filtered = filtered.filter((p) => p.is_active !== false)
    }

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredProviders(filtered)
  }, [providers, activeTab, searchTerm])

  const fetchAllProviders = async () => {
    try {
      console.log("[v0] Fetching all providers...")
      const [hospitals, ambulances, physios, labs] = await Promise.all([
        fetch("/api/admin/hospitals").then((r) => r.json()),
        fetch("/api/admin/ambulances").then((r) => r.json()),
        fetch("/api/admin/physios").then((r) => r.json()),
        fetch("/api/admin/labs").then((r) => r.json()),
      ])

      const allProviders: Provider[] = [
        ...(hospitals.hospitals?.map((h: any) => ({
          id: h.id,
          name: h.name,
          email: h.email,
          phone: h.phone,
          address: h.address || "ঢাকা",
          type: "hospital" as const,
          rating: 4.5,
          is_active: h.is_active !== false,
          services: h.specialties?.join(", ") || "সাধারণ সেবা",
        })) || []),
        ...(ambulances.ambulances?.map((a: any) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          address: a.address || "ঢাকা",
          type: "ambulance" as const,
          rating: 4.8,
          is_active: a.is_active !== false,
          is_available: a.is_available !== false,
          services: `${a.vehicle_type || "এম্বুলেন্স"} সেবা`,
        })) || []),
        ...(physios.physios?.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          address: p.address || "ঢাকা",
          type: "physio" as const,
          rating: 4.6,
          is_active: p.is_active !== false,
          is_available: p.is_available !== false,
          specialty: p.specialization,
          services: `${p.specialization || "ফিজিওথেরাপি"} - ৳${p.consultation_fee || 500}`,
        })) || []),
        ...(labs.labs?.map((l: any) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          phone: l.phone,
          address: l.address || "ঢাকা",
          type: "lab" as const,
          rating: 4.7,
          is_active: l.is_active !== false,
          services: l.specialties?.join(", ") || "ল্যাব সেবা",
        })) || []),
      ]

      console.log("[v0] Total providers loaded:", allProviders.length)
      setProviders(allProviders)
      setLoading(false)
    } catch (err) {
      console.error("[v0] Error fetching providers:", err)
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hospital":
        return "bg-blue-50 border-blue-200"
      case "ambulance":
        return "bg-red-50 border-red-200"
      case "physio":
        return "bg-green-50 border-green-200"
      case "lab":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return "🏥"
      case "ambulance":
        return "🚑"
      case "physio":
        return "💪"
      case "lab":
        return "🧪"
      default:
        return "🏢"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "hospital":
        return "হাসপাতাল"
      case "ambulance":
        return "অ্যাম্বুলেন্স"
      case "physio":
        return "ফিজিওথেরাপি"
      case "lab":
        return "ল্যাব"
      default:
        return "সেবা"
    }
  }

  const tabs = [
    { id: "all" as const, label: `সব (${providers.filter((p) => p.is_active !== false).length})`, count: providers.filter((p) => p.is_active !== false).length },
    { id: "hospital" as const, label: "হাসপাতাল", count: providers.filter((p) => p.type === "hospital" && p.is_active !== false).length },
    { id: "ambulance" as const, label: "অ্যাম্বুলেন্স", count: providers.filter((p) => p.type === "ambulance" && p.is_active !== false).length },
    { id: "physio" as const, label: "ফিজিও", count: providers.filter((p) => p.type === "physio" && p.is_active !== false).length },
    { id: "lab" as const, label: "ল্যাব", count: providers.filter((p) => p.type === "lab" && p.is_active !== false).length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-3 text-center">সব সেবা প্রদানকারী</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="হাসপাতাল, অ্যাম্বুলেন্স, ফিজিও খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white text-black border-0 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto bg-white sticky top-16 z-40 shadow-sm">
        <div className="flex gap-2 p-3 max-w-2xl mx-auto min-w-max">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap ${activeTab === tab.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-2 bg-white/30 px-2 py-1 rounded-full text-sm">{tab.count}</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-gray-500 text-lg mb-2">কোনো সেবা প্রদানকারী পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm">অনুসন্ধান শর্ত পরিবর্তন করে দেখুন</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className={`border-2 transition-all hover:shadow-lg cursor-pointer ${getTypeColor(provider.type)}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0">{getTypeIcon(provider.type)}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{provider.name}</h3>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{getTypeLabel(provider.type)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-100 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900">{provider.rating || 4.5}</span>
                        </div>
                      </div>

                      {/* Services */}
                      {provider.services && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-1">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {provider.services}
                        </p>
                      )}

                      {/* Address */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {provider.address}
                      </p>

                      {/* Status */}
                      {provider.is_available !== undefined && (
                        <div className="mb-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${provider.is_available ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                            {provider.is_available ? "পরিষেবা উপলব্ধ" : "পরিষেবা বন্ধ"}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <a href={`tel:${provider.phone}`} className="flex-1">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            কল করুন
                          </Button>
                        </a>
                        <a href={`mailto:${provider.email}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-lg">
                            ইমেইল
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✓ প্রতি ১০ সেকেন্ডে রিয়েল-টাইম আপডেট হয়</p>
        </div>
      </div>
    </div>
  )
}
