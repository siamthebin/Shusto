"use client"

import { useState } from "react"

export default function SetupDatabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setStatus("loading")
    setMessage("ডাটাবেস সেটআপ শুরু হচ্ছে...")

    try {
      const response = await fetch("/api/setup-database", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup database")
      }

      setStatus("success")
      setMessage("ডাটাবেস সফলভাবে সেটআপ হয়েছে! এখন আপনি ওষুধ সার্চ করতে পারবেন।")
    } catch (error: any) {
      console.error("Setup error:", error)
      setStatus("error")
      setMessage(`Error: ${error.message}. অনুগ্রহ করে Supabase Dashboard থেকে ম্যানুয়ালি SQL স্ক্রিপ্ট রান করুন।`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">ডাটাবেস সেটআপ</h1>
          <p className="text-zinc-600">মেডিসিন ডাটাবেস সেটআপ করতে নিচের বাটনে ক্লিক করুন</p>
        </div>

        {status === "idle" && (
          <button
            onClick={setupDatabase}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ডাটাবেস সেটআপ করুন
          </button>
        )}

        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mb-4"></div>
            <p className="text-zinc-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-semibold mb-4">{message}</p>
            <a
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              হোম পেজে যান
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>নোট:</strong> এই সেটআপ Napa সহ ২০+ জনপ্রিয় বাংলাদেশী ওষুধ যোগ করবে।
          </p>
        </div>
      </div>
    </div>
  )
}
