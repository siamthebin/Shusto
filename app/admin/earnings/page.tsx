"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Users, RefreshCw } from "lucide-react"
import Link from "next/link"

interface EarningRecord {
  id: string
  appointment_id?: string
  source: string
  doctor_name?: string
  total_fee: number
  commission_amount: number
  commission_rate: number
  created_at: string
}

export default function AdminEarnings() {
  const [platformEarnings, setPlatformEarnings] = useState<EarningRecord[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [monthEarnings, setMonthEarnings] = useState(0)
  const [weekEarnings, setWeekEarnings] = useState(0)
  const [totalConsultations, setTotalConsultations] = useState(0)
  const [commissionRate] = useState(30) // Fixed 30% for doctors
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    setIsLoading(true)
    
    // First try to load from localStorage
    const localEarnings = JSON.parse(localStorage.getItem("shusto_admin_earnings") || "[]") as EarningRecord[]
    
    // Also try Supabase
    let supabaseEarnings: EarningRecord[] = []
    try {
      const { data } = await supabase.from("platform_earnings").select("*").order("created_at", { ascending: false })
      if (data) {
        supabaseEarnings = data.map((e: any) => ({
          id: e.id,
          appointment_id: e.appointment_id,
          source: e.source || "consultation",
          doctor_name: e.doctor_name || "Unknown",
          total_fee: Number(e.total_fee) || 0,
          commission_amount: Number(e.commission_amount) || 0,
          commission_rate: Number(e.commission_rate) || 30,
          created_at: e.created_at
        }))
      }
    } catch (err) {
      console.log("[v0] Supabase fetch failed, using localStorage")
    }
    
    // Merge and deduplicate
    const allEarnings = [...localEarnings, ...supabaseEarnings]
    const uniqueEarnings = allEarnings.filter((e, index, self) => 
      index === self.findIndex(t => t.id === e.id)
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    setPlatformEarnings(uniqueEarnings)
    setTotalConsultations(uniqueEarnings.length)

    // Calculate totals
    const total = uniqueEarnings.reduce((sum, e) => sum + (e.commission_amount || 0), 0)
    setTotalEarnings(total)

    const today = new Date().toDateString()
    const todayTotal = uniqueEarnings
      .filter((e) => new Date(e.created_at).toDateString() === today)
      .reduce((sum, e) => sum + (e.commission_amount || 0), 0)
    setTodayEarnings(todayTotal)

    // This week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekTotal = uniqueEarnings
      .filter((e) => new Date(e.created_at) >= oneWeekAgo)
      .reduce((sum, e) => sum + (e.commission_amount || 0), 0)
    setWeekEarnings(weekTotal)

    const thisMonth = new Date().getMonth()
    const monthTotal = uniqueEarnings
      .filter((e) => new Date(e.created_at).getMonth() === thisMonth)
      .reduce((sum, e) => sum + (e.commission_amount || 0), 0)
    setMonthEarnings(monthTotal)
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Admin Earnings Dashboard</h1>
                <p className="text-emerald-100 text-sm">Shusto Platform Revenue (30% Commission)</p>
              </div>
            </div>
            <button 
              onClick={loadEarnings}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Today's Profit</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{todayEarnings.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{weekEarnings.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{monthEarnings.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total Profit</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Commission Rate</h2>
              <p className="text-emerald-100 text-sm">Every doctor consultation gives {commissionRate}% to Shusto</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{commissionRate}%</p>
              <p className="text-emerald-100 text-sm">{totalConsultations} consultations</p>
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Earnings History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : platformEarnings.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No earnings yet</p>
              <p className="text-gray-400 text-sm">Earnings will appear here when consultations are completed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Doctor</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Fee</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Your Profit (30%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {platformEarnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(earning.created_at).toLocaleDateString("bn-BD")}
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(earning.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full capitalize">
                          {earning.source?.replace("_", " ") || "Consultation"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{earning.doctor_name || "Doctor"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">৳{(earning.total_fee || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-600">৳{(earning.commission_amount || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
