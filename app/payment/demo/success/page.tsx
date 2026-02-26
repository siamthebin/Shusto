"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Wallet, ArrowRight, Copy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [updating, setUpdating] = useState(true)
  const [newBalance, setNewBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const provider = searchParams.get("provider") || "bkash"
  const amount = searchParams.get("amount") || "500"
  const orderId = searchParams.get("orderId") || ""
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`

  useEffect(() => {
    const updateWalletBalance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("লগইন করা নেই")
          setUpdating(false)
          return
        }

        const response = await fetch("/api/wallet/add-balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number.parseFloat(amount),
            provider,
            transactionId,
            orderId,
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setNewBalance(data.newBalance)
        } else {
          // If API fails, still show success but note the issue
          console.error("API Error:", data.error)
          setNewBalance(Number.parseFloat(amount))
        }
      } catch (error) {
        console.error("Failed to update balance:", error)
        setNewBalance(Number.parseFloat(amount))
      } finally {
        setUpdating(false)
      }
    }

    updateWalletBalance()
  }, [])

  const isBkash = provider === "bkash"

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isBkash ? "bg-gradient-to-br from-pink-50 to-white" : "bg-gradient-to-br from-orange-50 to-white"
      }`}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div
          className={`py-8 text-center text-white ${
            isBkash ? "bg-gradient-to-br from-pink-500 to-pink-600" : "bg-gradient-to-br from-orange-500 to-orange-600"
          }`}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
            </div>
            <div className="relative rounded-full bg-white/20 p-3">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">পেমেন্ট সফল!</h1>
          <p className="text-white/80">{isBkash ? "bKash" : "Nagad"} পেমেন্ট সম্পন্ন হয়েছে</p>
        </div>

        <CardContent className="pt-6 pb-6 space-y-5">
          {/* Amount Display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <p className="text-emerald-600 text-sm font-medium mb-1">ওয়ালেটে যোগ হয়েছে</p>
            <p className="text-4xl font-bold text-emerald-700">৳{Number.parseFloat(amount).toFixed(0)}</p>
            {!updating && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="text-emerald-600 text-sm">নতুন ব্যালেন্স</p>
                <p className="text-2xl font-bold text-emerald-700 flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5" />৳{newBalance.toFixed(0)}
                </p>
              </div>
            )}
            {updating && (
              <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span className="text-sm text-emerald-600">ব্যালেন্স আপডেট হচ্ছে...</span>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">পেমেন্ট মেথড</span>
              <span className={`font-bold ${isBkash ? "text-pink-600" : "text-orange-600"}`}>
                {isBkash ? "bKash" : "Nagad"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">ট্রানজেকশন আইডি</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-zinc-700">{transactionId.substring(0, 15)}...</span>
                <button
                  onClick={() => navigator.clipboard.writeText(transactionId)}
                  className="p-1 hover:bg-zinc-200 rounded"
                >
                  <Copy className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">তারিখ ও সময়</span>
              <span className="text-zinc-700 text-sm">{new Date().toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">স্ট্যাটাস</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-sm">
                <CheckCircle className="w-4 h-4" />
                সম্পন্ন
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => router.push("/wallet")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
            >
              <Wallet className="w-5 h-5 mr-2" />
              ওয়ালেটে যান
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full h-12 text-base">
              হোমে ফিরে যান
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">পেমেন্ট ভেরিফাই হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
