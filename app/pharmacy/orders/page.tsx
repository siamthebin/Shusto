"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  medicine_name: string
  medicine_id: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_amount: number
  status: string
  payment_method: string
  assigned_pharmacy_id: string
  assigned_pharmacy_name: string
  created_at: string
  items?: OrderItem[]
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "delivered">("all")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Get pharmacy ID from localStorage (set during login)
      const pharmacyEmail = localStorage.getItem("pharmacy_email")
      
      // For now, fetch all orders from localStorage as fallback
      const savedOrders = JSON.parse(localStorage.getItem("shusto_medicine_orders") || "[]")
      
      // Filter orders assigned to this pharmacy
      const pharmacyOrders = savedOrders.filter(
        (order: Order) => !pharmacyEmail || order.assigned_pharmacy_id || order.assignedPharmacy
      )

      setOrders(pharmacyOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
      setOrders(updatedOrders)
      localStorage.setItem("shusto_medicine_orders", JSON.stringify(updatedOrders))
    } catch (error) {
      console.error("Error updating order:", error)
      alert("অর্ডার আপডেট করতে ব্যর্থ হয়েছে")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-orange-600" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "ready":
        return <Package className="w-5 h-5 text-green-600" />
      case "delivered":
        return <Truck className="w-5 h-5 text-emerald-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "অপেক্ষমাণ",
      confirmed: "নিশ্চিত",
      ready: "প্রস্তুত",
      delivered: "ডেলিভার করা হয়েছে",
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/pharmacy/dashboard" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ওষুধের অর্ডার</h1>
          <p className="text-gray-600">আপনার ফার্মেসিতে অর্পিত অর্ডারগুলি পরিচালনা করুন</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "pending", "confirmed", "ready", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "সব" : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">কোনো অর্ডার পাওয়া যায়নি</p>
            <Link href="/pharmacy/dashboard" className="text-teal-600 font-semibold hover:underline">
              ড্যাশবোর্ডে ফিরুন
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">অর্ডার #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString("bn-BD")}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-semibold">{getStatusLabel(order.status)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">ফোন: {order.customer_phone}</p>
                    <p className="text-sm text-gray-600">ঠিকানা: {order.customer_address}</p>
                  </div>

                  {/* Order Items Summary */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">আইটেমগুলি:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="text-teal-700 font-semibold">মোট পরিমাণ: ৳{order.total_amount.toFixed(2)}</p>
                      <p className="text-gray-600">পেমেন্ট পদ্ধতি: {order.payment_method}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "confirmed")}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        নিশ্চিত করুন
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        প্রস্তুত
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        ডেলিভার করা সম্পন্ন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
