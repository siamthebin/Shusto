"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Dynamically set redirect URL based on current origin
    const origin = window.location.origin
    setRedirectUrl(`${origin}/auth/callback`)
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        throw error
      }
      
      // Detect user role and redirect to appropriate dashboard
      if (data.user?.email) {
        try {
          const roleResponse = await fetch("/api/detect-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.user.email }),
          })
          const roleData = await roleResponse.json()
          const dashboardPath = roleData.dashboardPath || "/dashboard"
          router.push(dashboardPath)
        } catch (roleError) {
          console.error("[v0] Role detection failed:", roleError)
          router.push("/dashboard")
        }
      }
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "লগইন ব্যর্থ হয়েছে")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      // Check if Supabase is properly configured
      if (!supabase.auth?.signInWithOAuth) {
        throw new Error("সিস্টেম এখনও কনফিগার করা হয়নি। দয়া করে পরে চেষ্টা করুন।")
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      })

      if (error) {
        throw error
      }
      // User will be redirected to Google
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Google লগইন ব্যর্থ হয়েছে")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-5">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">শু</span>
              </div>
              <span className="font-bold text-3xl text-emerald-600">Shusto</span>
            </Link>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl text-center font-bold">স্বাগতম</CardTitle>
              <CardDescription className="text-center text-sm">আপনার একাউন্টে লগইন করুন</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-4">
                {/* Show warning if Supabase is not configured */}
                {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ সিস্টেম এখনও সম্পূর্ণভাবে কনফিগার করা হয়নি। কিছু ফিচার কাজ নাও করতে পারে।
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-md h-14 text-base font-semibold active:scale-[0.98] transition-transform"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Google এ যাচ্ছে...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                      Google দিয়ে লগইন
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">অথবা ইমেইল দিয়ে</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      ইমেইল
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">
                      পাসওয়ার্ড
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold mt-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </Button>
                </form>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600">
                  একাউন্ট নেই?{" "}
                  <Link href="/auth/sign-up" className="text-emerald-600 hover:underline font-semibold">
                    সাইন আপ করুন
                  </Link>
                </p>

                <p className="text-xs text-center text-gray-500 px-2">
                  লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
