"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerificationPendingPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [status, setStatus] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?role=doctor")
        return
      }

      const { data: doctorProfile } = await supabase
        .from("doctor_profiles")
        .select("verification_status, rejection_reason")
        .eq("id", user.id)
        .single()

      if (doctorProfile) {
        setStatus(doctorProfile.verification_status)
        setRejectionReason(doctorProfile.rejection_reason)

        if (doctorProfile.verification_status === "approved") {
          router.push("/dashboard/doctor")
        }
      }
    }

    checkStatus()

    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === "rejected" ? "Application প্রত্যাখ্যাত" : "Verification অপেক্ষমাণ"}
          </CardTitle>
          <CardDescription>
            {status === "rejected"
              ? "আপনার doctor registration application প্রত্যাখ্যাত হয়েছে"
              : "আপনার doctor registration application review হচ্ছে"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "rejected" ? (
            <>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">প্রত্যাখ্যানের কারণ:</h3>
                    <p className="text-red-800">{rejectionReason || "কারণ উল্লেখ করা হয়নি"}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push("/doctor/register")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                পুনরায় আবেদন করুন
              </Button>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">Review চলছে</h3>
                    <p className="text-yellow-800">
                      Shusto admin আপনার BMDC registration ও অন্যান্য তথ্য verify করছে। এটি সাধারণত ২৪-৪৮ ঘণ্টা সময় নেয়।
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">পরবর্তী পদক্ষেপ:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Admin আপনার BMDC registration number verify করবে</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Qualification ও experience check করবে</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Approve হলে email notification পাবেন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>তারপর doctor dashboard access পাবেন</span>
                  </li>
                </ul>
              </div>

              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                হোম পেজে ফিরে যান
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
