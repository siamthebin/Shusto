"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Clock, CheckCircle, TrendingUp, RefreshCw, Building2, Volume2, VolumeX, Bell } from "lucide-react"

interface PharmacyOrder {
  id: string
  customer_name: string
  customer_phone: string
  items: any[]
  total_amount: number
  status: string
  created_at: string
  delivery_address?: string
}

interface Pharmacy {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export default function PharmacyDashboardPage() {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [orders, setOrders] = useState<PharmacyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const [lastOrderCount, setLastOrderCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 1.0
    
    // Check saved sound preference
    const savedSoundPref = localStorage.getItem("shusto_pharmacy_sound")
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === "true")
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log("Audio play failed:", err)
      })
    }
  }, [soundEnabled])

  // Toggle sound
  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem("shusto_pharmacy_sound", String(newValue))
    
    // Play test sound when enabling
    if (newValue && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const fetchLocalOrders = useCallback((pharmacyId: string, checkNewOrders = false) => {
    const allOrders = JSON.parse(localStorage.getItem("shusto_medicine_orders") || "[]")
    // Filter orders assigned to this pharmacy
    const pharmacyOrders = allOrders.filter(
      (o: PharmacyOrder) => o.pharmacy_id === pharmacyId || !o.pharmacy_id, // Show unassigned orders too
    )
    
    // Check for new orders
    if (checkNewOrders && pharmacyOrders.length > lastOrderCount && lastOrderCount > 0) {
      // New order received!
      playNotificationSound()
      setNewOrderAlert(true)
      setTimeout(() => setNewOrderAlert(false), 5000)
    }
    
    setLastOrderCount(pharmacyOrders.length)
    setOrders(pharmacyOrders)
  }, [lastOrderCount, playNotificationSound])

  useEffect(() => {
    const checkPharmacy = async () => {
      try {
        const response = await fetch("/api/pharmacy/profile")
        if (!response.ok) {
          router.push("/")
          return
        }
        const data = await response.json()
        setPharmacy(data.pharmacy)
        fetchLocalOrders(data.pharmacy.id)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching pharmacy profile:", error)
        router.push("/")
      }
    }

    checkPharmacy()
  }, [])

  // Auto-refresh orders every 10 seconds to check for new orders
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (pharmacy) {
      interval = setInterval(() => {
        fetchLocalOrders(pharmacy.id, true)
      }, 10000) // Check every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [pharmacy, fetchLocalOrders])

  const updateOrderStatus = (orderId: string, status: string) => {
    const allOrders = JSON.parse(localStorage.getItem("shusto_medicine_orders") || "[]")
    const updatedOrders = allOrders.map((o: any) => (o.id === orderId ? { ...o, status } : o))
    localStorage.setItem("shusto_medicine_orders", JSON.stringify(updatedOrders))
    if (pharmacy) {
      fetchLocalOrders(pharmacy.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">ফার্মেসি অ্যাকাউন্ট নেই</h2>
          <p className="text-gray-600 mb-4">এই ইমেইল দিয়ে কোনো ফার্মেসি নিবন্ধিত নেই</p>
          <Link href="/" className="text-teal-600 hover:underline">
            হোম এ ফিরে যান
          </Link>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing")
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "delivered")

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-8 pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>হোম এ ফিরে যান</span>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
              <p className="text-teal-100">{pharmacy.address}</p>
              <p className="text-teal-200 text-sm">{pharmacy.phone}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                <p className="text-sm text-gray-500">পেন্ডিং</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                <p className="text-sm text-gray-500">সম্পন্ন</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-sm text-gray-500">মোট অর্ডার</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">মোট বিক্রি</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "pending" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            পেন্ডিং অর্ডার ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "completed" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            সম্পন্ন ({completedOrders.length})
          </button>
          <button
            onClick={() => pharmacy && fetchLocalOrders(pharmacy.id)}
            className="ml-auto px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {(activeTab === "pending" ? pendingOrders : completedOrders).length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">কোনো অর্ডার নেই</p>
            </div>
          ) : (
            (activeTab === "pending" ? pendingOrders : completedOrders).map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.customer_name || "অজানা"}</h3>
                    <p className="text-sm text-gray-500">{order.customer_phone || "ফোন নেই"}</p>
                    {order.delivery_address && <p className="text-xs text-gray-400 mt-1">{order.delivery_address}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">৳{order.total_amount}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600">
                      {order.items.map((item: any) => `${item.name} x${item.quantity}`).join(", ")}
                    </p>
                  </div>
                )}

                {activeTab === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, "processing")}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      প্রসেসিং
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                    >
                      ডেলিভারি সম্পন্ন
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
