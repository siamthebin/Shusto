"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Wallet, ArrowRight, Copy, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [newBalance, setNewBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const provider = searchParams.get("provider") || "bkash"
  const amount = searchParams.get("amount") || "0"
  const transactionId = searchParams.get("transaction_id") || ""

  const isBkash = provider === "bkash"

  useEffect(() => {
    async function loadBalance() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

          if (wallet) {
            setNewBalance(wallet.balance)
          }
        }
      } catch (error) {
        console.error("Error loading balance:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBalance()
  }, [])

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isBkash
          ? "bg-gradient-to-br from-pink-50 via-white to-pink-50"
          : "bg-gradient-to-br from-orange-50 via-white to-orange-50"
      }`}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
        <div
          className={`py-10 text-center text-white relative overflow-hidden ${
            isBkash
              ? "bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700"
              : "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full animate-ping"></div>
              </div>
              <div className="relative rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">পেমেন্ট সফল!</h1>
            <p className="text-white/80 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isBkash ? "bKash" : "Nagad"} দিয়ে পেমেন্ট সম্পন্ন হয়েছে
            </p>
          </div>
        </div>

        <CardContent className="pt-6 pb-6 space-y-5">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-emerald-600 text-sm font-medium mb-1">ওয়ালেটে যোগ হয়েছে</p>
            <p className="text-5xl font-bold text-emerald-700">৳{Number(amount).toLocaleString("bn-BD")}</p>

            <div className="mt-4 pt-4 border-t border-emerald-200">
              <p className="text-emerald-600 text-sm mb-1">বর্তমান ব্যালেন্স</p>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  <span className="text-emerald-600">লোড হচ্ছে...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-emerald-700 flex items-center justify-center gap-2">
                  <Wallet className="w-6 h-6" />৳{newBalance.toLocaleString("bn-BD")}
                </p>
              )}
            </div>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">পেমেন্ট মেথড</span>
              <span className={`font-bold ${isBkash ? "text-pink-600" : "text-orange-600"}`}>
                {isBkash ? "bKash" : "Nagad"}
              </span>
            </div>

            {transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">ট্রানজেকশন আইডি</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-zinc-700">
                    {transactionId.length > 15 ? `${transactionId.substring(0, 15)}...` : transactionId}
                  </span>
                  <button onClick={copyTransactionId} className="p-1 hover:bg-zinc-200 rounded transition-colors">
                    <Copy className={`w-3.5 h-3.5 ${copied ? "text-emerald-600" : "text-zinc-500"}`} />
                  </button>
                </div>
              </div>
            )}

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

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => router.push("/wallet")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-base shadow-lg shadow-emerald-200"
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

export default function EkhoniSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
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
