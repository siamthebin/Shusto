"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X } from "lucide-react"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState("")
  const supabase = createClient()

  useEffect(() => {
    // Dynamically set redirect URL based on current origin
    const origin = window.location.origin
    setRedirectUrl(`${origin}/auth/callback`)
  }, [])

  const handleOAuthSignIn = async (provider: "google" | "facebook" | "apple") => {
    try {
      setError(null)
      setIsLoading(true)

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams:
            provider === "google"
              ? {
                  access_type: "offline",
                  prompt: "select_account",
                }
              : undefined,
        },
      })

      if (authError) {
        setError(`${provider} দিয়ে সাইন ইন ব্যর্থ হয়েছে। ত্রুটি: ${authError.message}`)
        setIsLoading(false)
        return
      }
      // User will be redirected to OAuth provider
    } catch (error) {
      setError(`একটি ত্রুটি ঘটেছে: ${error instanceof Error ? error.message : "অজানা ত্রুটি"}`)
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">সাইন ইন করুন</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-5">কেনাকাটা চালিয়ে যেতে আপনার পছন্দের মাধ্যমে সাইন ইন করুন</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google - Primary */}
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-base font-semibold text-gray-700">
                {isLoading ? "সাইন ইন হচ্ছে..." : "Google দিয়ে চালিয়ে যান"}
              </span>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleOAuthSignIn("apple")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-base font-semibold">{isLoading ? "সাইন ইন হচ্ছে..." : "Apple দিয়ে চালিয়ে যান"}</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleOAuthSignIn("facebook")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-base font-semibold">{isLoading ? "সাইন ইন হচ্ছে..." : "Facebook দিয়ে চালিয়ে যান"}</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-5">
            সাইন ইন করে, আপনি আমাদের সেবার শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন
          </p>
        </div>
      </div>
    </>
  )
}
