'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Phone, MapPin, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { protectDashboard } from '@/lib/dashboard-protection'

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
  const supabase = createClient()
  const [lab, setLab] = useState<LabData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLabData = async () => {
      try {
        console.log('[v0] Lab Dashboard: Verifying authenticated access...')
        
        // SECURE: Only the logged-in lab owner can access their dashboard
        const protection = await protectDashboard('lab')
        
        if (!protection.isAuthorized) {
          console.error('[v0] Lab Dashboard: Access DENIED -', protection.error)
          setError(protection.error || 'অ্যাক্সেস অস্বীকৃত')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        if (!protection.provider) {
          setError('ল্যাব তথ্য খুঁজে পাওয়া যায়নি')
          return
        }

        console.log('[v0] Lab Dashboard: AUTHORIZED -', protection.provider.name)
        setLab({
          id: protection.provider.id,
          name: protection.provider.name,
          email: protection.provider.email,
          phone: '',
          address: '',
        })
        
        await fetchOrders(protection.provider.id)
      } catch (err) {
        console.error('[v0] Lab Dashboard: Error:', err)
        setError('ড্যাশবোর্ড লোড করতে ত্রুটি হয়েছে')
        setLoading(false)
      }
    }

    loadLabData()
  }, [router, supabase])

  const fetchOrders = async (labId: string) => {
    try {
      const response = await fetch(`/api/lab/orders?labId=${labId}`)
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
      }
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching orders:', err)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('labEmail')
    localStorage.removeItem('labData')
    router.push('/lab/login')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">অ্যাক্সেস অস্বীকৃত</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            লগআউট করুন
          </button>
        </div>
      </div>
    )
  }

  if (loading || !lab) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>
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
          
          {loading ? (
            <p className="text-gray-600">লোড হচ্ছে...</p>
          ) : orders.length === 0 ? (
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
