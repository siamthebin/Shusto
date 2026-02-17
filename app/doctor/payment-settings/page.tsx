"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DoctorPaymentSettings() {
  const [bkashNumber, setBkashNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [earnings, setEarnings] = useState<any[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    loadPaymentInfo()
    loadEarnings()
  }, [])

  const loadPaymentInfo = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: doctorProfile } = await supabase.from("doctor_profiles").select("id").eq("user_id", user.id).single()

    if (doctorProfile) {
      const { data: paymentInfo } = await supabase
        .from("doctor_payment_info")
        .select("*")
        .eq("doctor_id", doctorProfile.id)
        .single()

      if (paymentInfo) {
        setBkashNumber(paymentInfo.bkash_number)
        setAccountHolderName(paymentInfo.account_holder_name)
      }
    }
  }

  const loadEarnings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: doctorProfile } = await supabase.from("doctor_profiles").select("id").eq("user_id", user.id).single()

    if (doctorProfile) {
      const { data: earningsData } = await supabase
        .from("doctor_earnings")
        .select("*")
        .eq("doctor_id", doctorProfile.id)
        .order("created_at", { ascending: false })

      if (earningsData) {
        setEarnings(earningsData)
        const total = earningsData
          .filter((e: any) => e.status === "paid")
          .reduce((sum: number, e: any) => sum + Number.parseFloat(e.net_amount), 0)
        const pending = earningsData
          .filter((e: any) => e.status === "pending")
          .reduce((sum: number, e: any) => sum + Number.parseFloat(e.net_amount), 0)
        setTotalEarnings(total)
        setPendingEarnings(pending)
      }
    }
  }

  const handleSave = async () => {
    if (!bkashNumber || !accountHolderName) {
      setMessage("সব তথ্য পূরণ করুন")
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMessage("লগইন করুন")
      setLoading(false)
      return
    }

    const { data: doctorProfile } = await supabase.from("doctor_profiles").select("id").eq("user_id", user.id).single()

    if (doctorProfile) {
      const { error } = await supabase.from("doctor_payment_info").upsert({
        doctor_id: doctorProfile.id,
        bkash_number: bkashNumber,
        account_holder_name: accountHolderName,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMessage("সেভ করতে সমস্যা হয়েছে")
      } else {
        setMessage("সফলভাবে সেভ হয়েছে")
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">পেমেন্ট সেটিংস</h1>

        {/* আয়ের সারসংক্ষেপ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">মোট আয়</h3>
            <p className="text-3xl font-bold text-emerald-600">৳{totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">অপেক্ষমাণ পেমেন্ট</h3>
            <p className="text-3xl font-bold text-orange-600">৳{pendingEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* বিকাশ অ্যাকাউন্ট সেটিংস */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">বিকাশ অ্যাকাউন্ট তথ্য</h2>
          <p className="text-sm text-gray-600 mb-6">আপনার পাওনা টাকা এই বিকাশ নম্বরে পাঠানো হবে</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">বিকাশ নম্বর</label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">অ্যাকাউন্ট হোল্ডারের নাম</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="আপনার নাম"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400"
            >
              {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>

            {message && (
              <p className={`text-center ${message.includes("সফল") ? "text-emerald-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* আয়ের ইতিহাস */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">আয়ের ইতিহাস</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">তারিখ</th>
                  <th className="text-left py-3 px-4">মোট টাকা</th>
                  <th className="text-left py-3 px-4">কমিশন</th>
                  <th className="text-left py-3 px-4">পাওনা</th>
                  <th className="text-left py-3 px-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr key={earning.id} className="border-b">
                    <td className="py-3 px-4">{new Date(earning.created_at).toLocaleDateString("bn-BD")}</td>
                    <td className="py-3 px-4">৳{Number.parseFloat(earning.gross_amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-red-600">
                      -৳{Number.parseFloat(earning.commission_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      ৳{Number.parseFloat(earning.net_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          earning.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : earning.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {earning.status === "paid" ? "পরিশোধিত" : earning.status === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
