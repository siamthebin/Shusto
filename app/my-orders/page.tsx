"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BalanceHeader from "@/components/kokonutui/balance-header"
import BottomNav from "@/components/kokonutui/bottom-nav"
import { Pill, TestTube, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react"

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_amount: number
  status: string
  payment_method: string
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

interface OrderItem {
  id: string
  medicine_name: string
  quantity: number
  price: number
  subtotal: number
}

interface LocalOrder {
  id: string
  type: "medicine" | "lab"
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: string
  createdAt: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "medicine" | "lab">("all")
  const supabase = createClient()

  useEffect(() => {
    loadLocalOrders()
  }, [])

  function loadLocalOrders() {
    if (typeof window === "undefined") return

    const savedMedicineOrders = localStorage.getItem("shusto_medicine_orders")
    const savedLabOrders = localStorage.getItem("shusto_lab_orders")

    const allLocalOrders: LocalOrder[] = []

    if (savedMedicineOrders) {
      try {
        const medicineOrders = JSON.parse(savedMedicineOrders)
        allLocalOrders.push(...medicineOrders.map((o: LocalOrder) => ({ ...o, type: "medicine" as const })))
      } catch (e) {
        console.error("Error loading medicine orders:", e)
      }
    }

    if (savedLabOrders) {
      try {
        const labOrders = JSON.parse(savedLabOrders)
        allLocalOrders.push(...labOrders.map((o: LocalOrder) => ({ ...o, type: "lab" as const })))
      } catch (e) {
        console.error("Error loading lab orders:", e)
      }
    }

    // Sort by date, newest first
    allLocalOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setLocalOrders(allLocalOrders)
  }

  async function searchOrders() {
    if (!phoneNumber.trim()) return

    try {
      setLoading(true)
      setSearched(true)

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (*)
        `,
        )
        .eq("customer_phone", phoneNumber.trim())
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelivery(orderId: string) {
    try {
      const { error } = await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)

      if (error) throw error
      searchOrders()
    } catch (error) {
      console.error("Error confirming delivery:", error)
    }
  }

  function updateLocalOrderStatus(orderId: string, newStatus: string) {
    setLocalOrders((prev) => {
      const updated = prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))

      // Save back to localStorage
      const medicineOrders = updated.filter((o) => o.type === "medicine")
      const labOrders = updated.filter((o) => o.type === "lab")

      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_medicine_orders", JSON.stringify(medicineOrders))
        localStorage.setItem("shusto_lab_orders", JSON.stringify(labOrders))
      }

      return updated
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }
    > = {
      pending: { variant: "outline", label: "অপেক্ষমাণ", icon: <Clock className="w-3 h-3" /> },
      received: { variant: "secondary", label: "গৃহীত", icon: <CheckCircle className="w-3 h-3" /> },
      processing: { variant: "default", label: "প্রক্রিয়াধীন", icon: <Package className="w-3 h-3" /> },
      delivered: { variant: "default", label: "ডেলিভারি হচ্ছে", icon: <Truck className="w-3 h-3" /> },
      completed: { variant: "default", label: "সম্পন্ন", icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { variant: "destructive", label: "বাতিল", icon: <XCircle className="w-3 h-3" /> },
    }

    const { variant, label, icon } = config[status] || { variant: "default" as const, label: status, icon: null }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    )
  }

  const filteredLocalOrders = localOrders.filter((order) => {
    if (activeTab === "all") return true
    return order.type === activeTab
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900 pb-24">
      <BalanceHeader />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-900">আমার অর্ডার</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "all"
                ? "bg-emerald-500 text-white"
                : "bg-white text-zinc-700 border border-zinc-200 hover:border-emerald-500"
            }`}
          >
            <Package className="w-4 h-4" />
            সব অর্ডার
          </button>
          <button
            onClick={() => setActiveTab("medicine")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "medicine"
                ? "bg-emerald-500 text-white"
                : "bg-white text-zinc-700 border border-zinc-200 hover:border-emerald-500"
            }`}
          >
            <Pill className="w-4 h-4" />
            ওষুধ অর্ডার
          </button>
          <button
            onClick={() => setActiveTab("lab")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "lab"
                ? "bg-emerald-500 text-white"
                : "bg-white text-zinc-700 border border-zinc-200 hover:border-emerald-500"
            }`}
          >
            <TestTube className="w-4 h-4" />
            ল্যাব টেস্ট
          </button>
        </div>

        {/* Search by phone */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">ফোন নম্বর দিয়ে অর্ডার খুঁজুন</p>
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="ফোন নম্বর লিখুন"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchOrders()}
              className="flex-1"
            />
            <Button onClick={searchOrders} disabled={loading || !phoneNumber.trim()} size="sm">
              খুঁজুন
            </Button>
          </div>
        </div>

        {filteredLocalOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-900">
              <Package className="w-5 h-5 text-emerald-600" />
              আপনার অর্ডার ({filteredLocalOrders.length})
            </h2>
            <div className="space-y-4">
              {filteredLocalOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {order.type === "medicine" ? (
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Pill className="w-4 h-4 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <TestTube className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-900">
                          {order.type === "medicine" ? "ওষুধ অর্ডার" : "ল্যাব টেস্ট বুকিং"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="border-t border-zinc-100 pt-3 mt-3">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-zinc-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-zinc-900">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                      <span className="font-semibold text-zinc-900">মোট:</span>
                      <span className="text-lg font-bold text-emerald-600">৳{order.total}</span>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => updateLocalOrderStatus(order.id, "cancelled")}
                      >
                        বাতিল করুন
                      </Button>
                    </div>
                  )}

                  {order.status === "delivered" && (
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateLocalOrderStatus(order.id, "completed")}
                    >
                      ✓ আমি পেয়েছি
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Orders */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-zinc-500">লোড হচ্ছে...</p>
          </div>
        ) : searched && orders.length === 0 && filteredLocalOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500">কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-zinc-900">{order.customer_name}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-zinc-600">📍 {order.customer_address}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(order.created_at).toLocaleString("bn-BD")}</p>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-3">
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm bg-zinc-50 p-2 rounded">
                        <span className="text-zinc-600">
                          {item.medicine_name} × {item.quantity}
                        </span>
                        <span className="font-medium text-zinc-900">৳{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-900">মোট:</span>
                    <span className="text-lg font-bold text-emerald-600">৳{order.total_amount}</span>
                  </div>

                  {order.status === "delivered" && (
                    <Button
                      onClick={() => confirmDelivery(order.id)}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      ✓ আমি সার্ভিস পেয়েছি
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state when no orders at all */}
        {!searched && filteredLocalOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">কোনো অর্ডার নেই</h3>
            <p className="text-zinc-500 mb-4">ওষুধ বা ল্যাব টেস্ট অর্ডার করুন</p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <a href="/medicines">
                  <Pill className="w-4 h-4 mr-2" />
                  ওষুধ কিনুন
                </a>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href="/lab-tests">
                  <TestTube className="w-4 h-4 mr-2" />
                  ল্যাব টেস্ট বুক করুন
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
