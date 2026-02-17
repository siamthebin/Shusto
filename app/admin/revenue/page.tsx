"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  Stethoscope,
  Truck,
  FlaskConical,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { getDailySales, getShustoEarnings, getRevenueSplitInfo, type DailySale } from "@/lib/revenue-sharing"

export default function RevenuePage() {
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [revenueSplit, setRevenueSplit] = useState<any[]>([])

  useEffect(() => {
    setDailySales(getDailySales(30))
    setTotalEarnings(getShustoEarnings())
    setRevenueSplit(getRevenueSplitInfo())
  }, [])

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case "PHARMACY":
        return <Building2 className="w-5 h-5" />
      case "HOSPITAL":
        return <Building2 className="w-5 h-5" />
      case "DOCTOR":
        return <Stethoscope className="w-5 h-5" />
      case "AMBULANCE":
        return <Truck className="w-5 h-5" />
      case "LAB":
        return <FlaskConical className="w-5 h-5" />
      case "PHYSIO_NURSE":
        return <Heart className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getServiceLabel = (serviceName: string) => {
    switch (serviceName) {
      case "PHARMACY":
        return "ফার্মেসি"
      case "HOSPITAL":
        return "হাসপাতাল (ICU/Cabin)"
      case "DOCTOR":
        return "ডাক্তার (ফি)"
      case "AMBULANCE":
        return "অ্যাম্বুলেন্স"
      case "LAB":
        return "ল্যাব (টেস্ট)"
      case "PHYSIO_NURSE":
        return "ফিজিও ও নার্স"
      default:
        return serviceName
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">রেভিনিউ ড্যাশবোর্ড</h1>
            <p className="text-sm text-teal-100">Shusto আয় এবং বিক্রয় ট্র্যাকিং</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Total Earnings Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-green-100">মোট Shusto আয়</span>
          </div>
          <p className="text-4xl font-bold">৳{totalEarnings.toLocaleString()}</p>
        </div>

        {/* Revenue Split Table */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="bg-gray-900 text-white p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              রেভিনিউ স্প্লিট চার্ট
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="text-left p-3">সার্ভিস</th>
                  <th className="text-center p-3">Shusto %</th>
                  <th className="text-center p-3">Provider %</th>
                  <th className="text-center p-3">মান</th>
                </tr>
              </thead>
              <tbody>
                {revenueSplit.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 flex items-center gap-2">
                      {getServiceIcon(item.serviceName)}
                      <span>{getServiceLabel(item.serviceName)}</span>
                    </td>
                    <td className="text-center p-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                        {item.shustoPercent}%
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                        {item.providerPercent}%
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          item.affordability === "High"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.affordability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Sales History */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="bg-gray-900 text-white p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              দৈনিক বিক্রয় (Daily Sales)
            </h2>
          </div>

          {dailySales.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>এখনো কোনো বিক্রয় হয়নি</p>
            </div>
          ) : (
            <div className="divide-y">
              {dailySales.map((sale, index) => (
                <div key={index} className="p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-lg">{sale.date}</span>
                    <span className="text-2xl font-bold text-green-600">৳{sale.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded">{sale.transactions} টি লেনদেন</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Shusto: ৳{sale.shustoEarnings.toLocaleString()}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Providers: ৳{sale.providerPayouts.toLocaleString()}
                    </span>
                  </div>
                  {/* Breakdown by service */}
                  {Object.keys(sale.breakdown).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(sale.breakdown).map(([service, data]) => (
                        <span key={service} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                          {getServiceIcon(service)}
                          {getServiceLabel(service)}: ৳{data?.amount.toLocaleString()} ({data?.count})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
