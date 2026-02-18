"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [])

  const loadInvitation = async () => {
    const token = searchParams.get("token")
    if (!token) {
      alert("Invalid invitation link")
      return
    }

    const { data, error } = await supabase
      .from("doctor_invitations")
      .select("*")
      .eq("invitation_token", token)
      .eq("status", "pending")
      .single()

    if (error || !data) {
      alert("Invitation not found or expired")
      setLoading(false)
      return
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      alert("Invitation has expired")
      setLoading(false)
      return
    }

    setInvitation(data)
    setLoading(false)
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (password !== confirmPassword) {
      alert("পাসওয়ার্ড মিলছে না")
      setSubmitting(false)
      return
    }

    if (password.length < 6) {
      alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      setSubmitting(false)
      return
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
      })

      if (authError) throw authError

      if (!authData.user) throw new Error("Failed to create user")

      // Create user profile with doctor role
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        role: "doctor",
        full_name: invitation.email,
      })

      if (profileError) throw profileError

      // Mark invitation as accepted
      await supabase.from("doctor_invitations").update({ status: "accepted" }).eq("id", invitation.id)

      alert("আপনার ডাক্তার account তৈরি হয়েছে! এখন profile সম্পূর্ণ করুন।")
      router.push("/doctor/profile")
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Invalid or expired invitation</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>ডাক্তার Invitation</CardTitle>
          <CardDescription>Shusto তে আপনাকে স্বাগতম! আপনার account তৈরি করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm">
              <strong>Email:</strong> {invitation.email}
            </p>
            {invitation.specialization && (
              <p className="text-sm mt-1">
                <strong>বিশেষত্ব:</strong> {invitation.specialization}
              </p>
            )}
          </div>

          <form onSubmit={handleAccept} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {submitting ? "তৈরি করা হচ্ছে..." : "Account তৈরি করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
