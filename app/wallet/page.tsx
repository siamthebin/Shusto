"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Wallet, Plus, History, AlertCircle, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react"

function WalletContent() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecharge, setShowRecharge] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isPatient, setIsPatient] = useState(true)
  const [accountType, setAccountType] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    loadWalletData()

    const paymentStatus = searchParams.get("payment_status")

    if (paymentStatus) {
      if (paymentStatus === "success" || paymentStatus === "Success") {
        loadWalletData()
      }
      router.replace("/wallet")
    }
  }, [searchParams])

  async function loadWalletData() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      const userEmail = authUser.email?.toLowerCase() || ""

      // Check if admin
      if (userEmail === "shustobd@gmail.com") {
        setIsPatient(false)
        setAccountType("admin")
      }

      // Check if pharmacy
      try {
        const pharmacyRes = await fetch(`/api/pharmacies?email=${encodeURIComponent(authUser.email || "")}`)
        const pharmacyData = await pharmacyRes.json()
        if (pharmacyData.pharmacy) {
          setIsPatient(false)
          setAccountType("pharmacy")
        }
      } catch {}

      // Check if lab
      try {
        const labRes = await fetch(`/api/labs?email=${encodeURIComponent(authUser.email || "")}`)
        const labData = await labRes.json()
        if (labData.lab) {
          setIsPatient(false)
          setAccountType("lab")
        }
      } catch {}

      // Check user_profiles for role
      const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", authUser.id).single()

      if (profile?.role && profile.role !== "patient") {
        setIsPatient(false)
        setAccountType(profile.role)
      }

      // Load wallet balance
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", authUser.id).single()

      if (wallet) {
        setBalance(wallet.balance)
      } else {
        // Create wallet if not exists
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: authUser.id, balance: 0 })
          .select()
          .single()

        if (newWallet) setBalance(0)
      }

      // Load transactions
      const { data: walletData } = await supabase.from("wallets").select("id").eq("user_id", authUser.id).single()

      if (walletData) {
        const { data: txns } = await supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(20)

        setTransactions(txns || [])
      }
    } catch (error) {
      console.error("Error loading wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 pt-8 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">আমার ওয়ালেট</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Balance Card - Floating */}
      <div className="max-w-lg mx-auto px-4 -mt-14">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">মোট ব্যালেন্স</p>
                <h2 className="text-3xl font-bold text-zinc-900">৳{balance.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          {isPatient ? (
            <button
              onClick={() => setShowRecharge(true)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Plus className="w-5 h-5" />
              টাকা যোগ করুন (কার্ড/ব্যাংক)
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {accountType === "admin" && "এডমিন একাউন্ট"}
                    {accountType === "pharmacy" && "ফার্মেসি একাউন্ট"}
                    {accountType === "lab" && "ল্যাব একাউন্ট"}
                    {accountType === "doctor" && "ডাক্তার একাউন্ট"}
                    {accountType === "hospital" && "হাসপাতাল একাউন্ট"}
                    {accountType === "ambulance" && "অ্যাম্বুলেন্স একাউন্ট"}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    শুধুমাত্র রোগী/পেশেন্ট একাউন্ট থেকে টাকা যোগ করা যায়। Provider একাউন্টে টাকা স্বয়ংক্রিয়ভাবে জমা হবে সার্ভিস প্রদানের পর।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs font-medium">মোট জমা</span>
            </div>
            <p className="text-lg font-bold text-zinc-900">
              ৳
              {transactions
                .filter((t) => t.type === "credit")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-medium">মোট খরচ</span>
            </div>
            <p className="text-lg font-bold text-zinc-900">
              ৳
              {transactions
                .filter((t) => t.type === "debit")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(0)}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-zinc-600" />
            <h3 className="text-lg font-bold text-zinc-900">ট্রানজেকশন হিস্ট্রি</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500">কোনো ট্রানজেকশন নেই</p>
              {isPatient && (
                <button
                  onClick={() => setShowRecharge(true)}
                  className="mt-4 text-emerald-600 font-semibold text-sm hover:underline"
                >
                  প্রথম রিচার্জ করুন
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          txn.type === "credit" ? "bg-emerald-100" : "bg-red-100"
                        }`}
                      >
                        {txn.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{txn.description}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(txn.created_at).toLocaleDateString("bn-BD")} • {txn.payment_method || "Wallet"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                        {txn.type === "credit" ? "+" : "-"}৳{txn.amount.toFixed(0)}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {txn.status === "completed" ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : txn.status === "pending" ? (
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span
                          className={`text-xs ${
                            txn.status === "completed"
                              ? "text-emerald-600"
                              : txn.status === "pending"
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {txn.status === "completed" ? "সম্পন্ন" : txn.status === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recharge Modal - Now uses Demo mode option */}
      {showRecharge && isPatient && <RechargeModal onClose={() => setShowRecharge(false)} onSuccess={loadWalletData} />}
    </div>
  )
}

function RechargeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "sslcommerz">("sslcommerz")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const quickAmounts = [100, 500, 1000, 2000]

  async function handlePayment() {
    if (!amount || Number.parseFloat(amount) < 10) {
      setError("সর্বনিম্ন ১০ টাকা রিচার্জ করতে হবে")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("প্রথমে লগইন করুন")
        setLoading(false)
        return
      }

      if (paymentMethod === "sslcommerz") {
        // Initialize SSLCommerz payment
        console.log("[v0] Initializing SSLCommerz payment for wallet recharge")
        const response = await fetch("/api/payment/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number.parseFloat(amount),
            provider: "wallet",
            user_id: user.id,
          }),
        })

        const data = await response.json()
        console.log("[v0] SSLCommerz response:", data)

        if (data.success && data.post_params && data.sslcommerz_url) {
          // Create form and submit to SSLCommerz
          const form = document.createElement("form")
          form.method = "POST"
          form.action = data.sslcommerz_url

          Object.keys(data.post_params).forEach((key) => {
            const input = document.createElement("input")
            input.type = "hidden"
            input.name = key
            input.value = data.post_params[key]
            form.appendChild(input)
          })

          document.body.appendChild(form)
          form.submit()
          document.body.removeChild(form)
        } else {
          setError(data.message || "পেমেন্ট শুরু করতে সমস্যা হয়েছে")
          setLoading(false)
        }
      } else {
        // For bKash/Nagad - keep existing logic if needed
        setError("bKash এবং Nagad এখনও আপডেট হচ্ছে")
        setLoading(false)
      }
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      setError("পেমেন্ট শুরু করতে সমস্যা হয়েছে: " + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900">টাকা যোগ করুন</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sandbox Mode Banner - Only show for demo test card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">SSLCommerz Payment Gateway</p>
                <p className="text-xs text-blue-600 mt-1">নিরাপদ অনলাইন পেমেন্ট প্রসেসিং। সব ধরনের কার্ড ও মোবাইল ব্যাংকিং সাপোর্ট করে।</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">পরিমাণ (৳)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    amount === amt.toString()
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-3">পেমেন্ট মেথড নির্বাচন করুন</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("sslcommerz")}
                className={`relative py-4 rounded-xl font-bold text-sm transition-all ${
                  paymentMethod === "sslcommerz"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200"
                }`}
              >
                {paymentMethod === "sslcommerz" && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                কার্ড/ব্যাংক
              </button>
              <button
                onClick={() => setPaymentMethod("bkash")}
                className={`relative py-4 rounded-xl font-bold text-sm transition-all ${
                  paymentMethod === "bkash"
                    ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200 scale-[1.02]"
                    : "bg-pink-50 text-pink-600 hover:bg-pink-100 border-2 border-pink-200"
                }`}
              >
                {paymentMethod === "bkash" && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                bKash
              </button>
              <button
                onClick={() => setPaymentMethod("nagad")}
                className={`relative py-4 rounded-xl font-bold text-sm transition-all ${
                  paymentMethod === "nagad"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 scale-[1.02]"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-100 border-2 border-orange-200"
                }`}
              >
                {paymentMethod === "nagad" && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                Nagad
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm text-emerald-800">
              {paymentMethod === "sslcommerz" ? (
                <>
                  <strong>ক্রেডিট/ডেবিট কার্ড</strong> অথবা <strong>মোবাইল ব্যাংকিং</strong> দিয়ে পেমেন্ট করুন। পেমেন্ট সম্পন্ন হলে
                  স্বয়ংক্রিয়ভাবে আপনার Shusto ওয়ালেটে ব্যালেন্স যুক্ত হবে।
                </>
              ) : (
                <>
                  <strong>{paymentMethod === "bkash" ? "bKash" : "Nagad"}</strong> পেমেন্ট পেজে রিডাইরেক্ট হবে। পেমেন্ট সম্পন্ন
                  হলে স্বয়ংক্রিয়ভাবে আপনার Shusto ওয়ালেটে ব্যালেন্স যুক্ত হবে।
                </>
              )}
            </p>
          </div>

          {/* Secured By */}
          <p className="text-center text-xs text-zinc-500">
            নিরাপদ পেমেন্ট গেটওয়ে দ্বারা পরিচালিত
          </p>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !amount}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || !amount
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : paymentMethod === "sslcommerz"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200"
                  : paymentMethod === "bkash"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-200"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path fillRule="evenodd" className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                লোড হচ্ছে...
              </span>
            ) : (
              `${paymentMethod === "bkash" ? "bKash" : "Nagad"} দিয়ে ৳${amount || "0"} পে করুন`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  )
}
