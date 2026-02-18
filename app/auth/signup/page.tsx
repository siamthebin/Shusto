"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "সাইন আপ ব্যর্থ হয়েছে")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-emerald-600">সফল হয়েছে!</CardTitle>
            <CardDescription className="text-center">
              আপনার ইমেইল চেক করুন এবং verification link এ ক্লিক করুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full bg-emerald-600 hover:bg-emerald-700">
              লগইন পেজে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">শু</span>
              </div>
              <span className="font-bold text-3xl text-emerald-600">Shusto</span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">সাইন আপ করুন</CardTitle>
              <CardDescription className="text-center">নতুন অ্যাকাউন্ট তৈরি করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                    {isLoading ? "সাইন আপ হচ্ছে..." : "সাইন আপ করুন"}
                  </Button>
                </div>
              </form>

              <div className="mt-4 text-center text-sm">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                <Link href="/auth/login" className="text-emerald-600 underline underline-offset-4 font-semibold">
                  লগইন করুন
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
