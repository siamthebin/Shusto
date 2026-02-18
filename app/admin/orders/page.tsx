"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  async function fetchOrders() {
    try {
      setLoading(true)
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false })

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      // Refresh orders
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      received: "secondary",
      processing: "default",
      delivered: "default",
      completed: "default",
      cancelled: "destructive",
    }

    const labels: Record<string, string> = {
      pending: "অপেক্ষমাণ",
      received: "গৃহীত",
      processing: "প্রক্রিয়াধীন",
      delivered: "ডেলিভারি হচ্ছে",
      completed: "সম্পন্ন",
      cancelled: "বাতিল",
    }

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">অর্ডার ম্যানেজমেন্ট</h1>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="স্ট্যাটাস ফিল্টার করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব অর্ডার</SelectItem>
              <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
              <SelectItem value="received">গৃহীত</SelectItem>
              <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
              <SelectItem value="delivered">ডেলিভারি হচ্ছে</SelectItem>
              <SelectItem value="completed">সম্পন্ন</SelectItem>
              <SelectItem value="cancelled">বাতিল</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">লোড হচ্ছে...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{order.customer_name}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">📞 {order.customer_phone}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">📍 {order.customer_address}</p>
                    <p className="text-xs text-zinc-500 mt-2">{new Date(order.created_at).toLocaleString("bn-BD")}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
                        <SelectItem value="received">গৃহীত</SelectItem>
                        <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                        <SelectItem value="delivered">ডেলিভারি হচ্ছে</SelectItem>
                        <SelectItem value="completed">সম্পন্ন</SelectItem>
                        <SelectItem value="cancelled">বাতিল</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <h4 className="font-medium mb-3">অর্ডার আইটেম:</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded"
                      >
                        <span>
                          {item.medicine_name} × {item.quantity}
                        </span>
                        <span className="font-medium">৳{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="font-semibold">মোট:</span>
                    <span className="text-lg font-bold text-emerald-600">৳{order.total_amount}</span>
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded">
                      <p className="text-sm">
                        <span className="font-medium">নোট:</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
