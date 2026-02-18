"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Copy } from "lucide-react"

function DemoPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState<"loading" | "input" | "processing">("loading")
  const [accountNumber, setAccountNumber] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const provider = searchParams.get("provider") || "bkash"
  const amount = searchParams.get("amount") || "500"
  const orderId = searchParams.get("orderId") || ""

  const credentials = {
    bkash: { number: "01929918378", otp: "123456", pin: "12121" },
    nagad: { number: "01711223344", otp: "123456", pin: "1234" },
  }

  const creds = credentials[provider as keyof typeof credentials]
  const isBkash = provider === "bkash"

  useEffect(() => {
    if (step === "loading") {
      const timer = setTimeout(() => setStep("input"), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleConfirm = async () => {
    if (!accountNumber || accountNumber.length < 11) {
      return
    }
    setStep("processing")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push(`/payment/demo/success?provider=${provider}&amount=${amount}&orderId=${orderId}`)
  }

  if (step === "loading") {
    return (
      <div className={`min-h-screen flex flex-col ${isBkash ? "bg-[#E2136E]" : "bg-[#F15B2A]"}`}>
        {/* Logo Header */}
        <div className="bg-white py-6 px-4 text-center border-b">
          <div className={`inline-flex items-center gap-2 ${isBkash ? "text-[#E2136E]" : "text-[#F15B2A]"}`}>
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
              <path d="M20 30 L35 45 L65 20 M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0" />
            </svg>
            <span className="text-2xl font-bold">{isBkash ? "বিকাশ" : "নগদ"}</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Animated Dots */}
          <div className="flex gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-white"
                style={{
                  animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-white text-xl font-medium">Loading</p>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-lg font-semibold">16247</span>
          </div>
          <p className="text-sm opacity-90">© 2025 {isBkash ? "bKash" : "Nagad"}, All Rights Reserved</p>
        </div>

        <style jsx>{`
          @keyframes pulse-dot {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(0.8); 
            }
            50% { 
              opacity: 1; 
              transform: scale(1.2); 
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header matching real bKash */}
      <header className={`${isBkash ? "bg-[#2C3E50]" : "bg-[#F15B2A]"} text-white px-4 py-3`}>
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{isBkash ? "bKash" : "Nagad"}</h1>
          <div className="flex gap-3">
            <button className="p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
            <button className="p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Logo Section */}
      <div className="bg-white py-6 text-center border-b">
        <div className={`inline-block ${isBkash ? "text-[#E2136E]" : "text-[#F15B2A]"}`}>
          <svg className="w-20 h-20 mx-auto" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              d="M30 50 L43 63 L70 36"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {/* Merchant Info */}
        <div className="px-4 py-4 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">TokenizedMerchant02</h3>
              <p className="text-xs text-gray-500 truncate">Inv No: INV-{orderId || "ORD1764394366596"}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-gray-900">৳{amount}</p>
            </div>
          </div>
        </div>

        {/* Sandbox Credentials */}
        <div className="px-4 py-4 bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">Sandbox</span>
            <span className="text-sm font-medium text-gray-700">Test Credentials</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">{creds.number}</span>
                <button
                  onClick={() => copyToClipboard(creds.number, "number")}
                  className="p-1.5 hover:bg-green-100 rounded transition-colors"
                >
                  <Copy className={`h-4 w-4 ${copied === "number" ? "text-green-600" : "text-green-700"}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">OTP:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">{creds.otp}</span>
                <button
                  onClick={() => copyToClipboard(creds.otp, "otp")}
                  className="p-1.5 hover:bg-green-100 rounded transition-colors"
                >
                  <Copy className={`h-4 w-4 ${copied === "otp" ? "text-green-600" : "text-green-700"}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">PIN:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">{creds.pin}</span>
                <button
                  onClick={() => copyToClipboard(creds.pin, "pin")}
                  className="p-1.5 hover:bg-green-100 rounded transition-colors"
                >
                  <Copy className={`h-4 w-4 ${copied === "pin" ? "text-green-600" : "text-green-700"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Number Input Section */}
        <div className={`${isBkash ? "bg-[#E2136E]" : "bg-[#F15B2A]"} px-4 py-8 text-white text-center`}>
          <h2 className="text-lg font-semibold mb-4">Your {isBkash ? "bKash" : "Nagad"} Account Number</h2>

          <input
            type="tel"
            placeholder="e.g 01XXXXXXXXX"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
            maxLength={11}
            disabled={step === "processing"}
            className="w-full px-4 py-3 text-center text-gray-900 text-lg rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
          />

          <p className="mt-4 text-sm opacity-95">
            Confirm and proceed, <span className="underline cursor-pointer">terms & conditions</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-0 border-t">
          <button
            onClick={() => router.back()}
            disabled={step === "processing"}
            className="flex-1 py-4 text-gray-700 font-medium border-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!accountNumber || accountNumber.length < 11 || step === "processing"}
            className={`flex-1 py-4 font-medium transition-colors ${
              !accountNumber || accountNumber.length < 11 || step === "processing"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : `${isBkash ? "bg-pink-100 text-pink-700" : "bg-orange-100 text-orange-700"} hover:bg-opacity-80`
            }`}
          >
            {step === "processing" ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span className="text-pink-600 font-semibold">16247</span>
        </div>
        <p>© 2025 {isBkash ? "bKash" : "Nagad"}, All Rights Reserved</p>
      </footer>
    </div>
  )
}

export default function DemoPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E2136E] flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <DemoPaymentContent />
    </Suspense>
  )
}
