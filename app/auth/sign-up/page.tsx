"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/${role === "doctor" ? "doctor/verification-pending" : "dashboard/patient"}`,
          data: {
            name: name,
            role: role,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase.from("user_profiles").insert({
          id: data.user.id,
          role: role,
          full_name: name,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        if (role === "doctor") {
          setSuccess(true)
          setTimeout(() => {
            router.push("/doctor/register")
            router.refresh()
          }, 1500)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      setError(error.message || "সাইনআপ করতে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">সাইনআপ সফল হয়েছে!</h2>
              <p className="text-muted-foreground">
                {role === "doctor"
                  ? "আপনাকে ডাক্তার রেজিস্ট্রেশন পেজে নিয়ে যাওয়া হচ্ছে..."
                  : "আপনাকে রোগী ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">সাইনআপ করুন</CardTitle>
          <CardDescription className="text-center">নতুন একাউন্ট তৈরি করুন</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label>আপনি কে?</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === "patient" ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">রোগী</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === "doctor" ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-medium">ডাক্তার</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                type="text"
                placeholder="আপনার নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "সাইনআপ করা হচ্ছে..." : "সাইনআপ"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              আগে থেকেই একাউন্ট আছে?{" "}
              <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
                লগইন করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
