'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Phone, MapPin, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface LabData {
  id: string
  name: string
  email: string
  phone: string
  address: string
  license_number?: string
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  status: string
  created_at: string
}

export default function LabDashboard() {
  const router = useRouter()
  const [lab, setLab] = useState<LabData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLabData()
  }, [])

  const loadLabData = async () => {
    try {
      const labEmail = localStorage.getItem('labEmail')
      const response = await fetch("/api/lab/profile", {
        headers: {
          'x-lab-email': labEmail || ''
        }
      })
      if (!response.ok) {
        const labData = localStorage.getItem('labData')
        if (labData) {
          const data = JSON.parse(labData)
          setLab(data)
          if (data.id) fetchOrders(data.id)
          setLoading(false)
          return
        }
        router.push("/")
        return
      }
      const data = await response.json()
      setLab(data.lab)
      if (data.lab?.id) {
        fetchOrders(data.lab.id)
      }
    } catch (err) {
      console.error('[v0] Error loading lab data:', err)
      const labData = localStorage.getItem('labData')
      if (labData) {
        const data = JSON.parse(labData)
        setLab(data)
        if (data.id) fetchOrders(data.id)
        setLoading(false)
        return
      }
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (labId: string) => {
    try {
      const response = await fetch(`/api/lab/orders?labId=${labId}`)
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error('[v0] Error fetching orders:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('labEmail')
    localStorage.removeItem('labData')
    router.push('/lab/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">আপনি ল্যাব হিসেবে নিবন্ধিত নন</p>
          <Link href="/">
            <Button>হোম এ ফিরে যান</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{lab.name}</h1>
            <p className="text-purple-100">{lab.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">ল্যাবের তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">যোগাযোগ</p>
                <p className="font-semibold">{lab.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ঠিকানা</p>
                <p className="font-semibold">{lab.address || 'N/A'}</p>
              </div>
            </div>
            {lab.license_number && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">লাইসেন্স নম্বর</p>
                  <p className="font-semibold">{lab.license_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">টেস্ট বুকিং</h2>
          
          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">কোনো বুকিং পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'অপেক্ষমান' :
                       order.status === 'confirmed' ? 'নিশ্চিত' : order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('bn-BD')}
                    </p>
                    <p className="font-semibold text-purple-600">৳{order.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
