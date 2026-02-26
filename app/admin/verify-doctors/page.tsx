"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface DoctorApplication {
  id: string
  specialization: string
  qualification: string
  experience_years: number
  consultation_fee: number
  bmdc_number: string
  bio: string
  verification_status: string
  user_profiles: {
    full_name: string
  }
}

export default function VerifyDoctorsPage() {
  const supabase = createBrowserClient()
  const [applications, setApplications] = useState<DoctorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    const { data } = await supabase
      .from("doctor_profiles")
      .select(
        `
        *,
        user_profiles(full_name)
      `,
      )
      .eq("verification_status", "pending")

    if (data) {
      setApplications(data as any)
    }
    setLoading(false)
  }

  const handleApprove = async (doctorId: string) => {
    const { error } = await supabase
      .from("doctor_profiles")
      .update({
        verification_status: "approved",
        verified_at: new Date().toISOString(),
      })
      .eq("id", doctorId)

    if (!error) {
      alert("ডাক্তার অনুমোদিত হয়েছে!")
      loadApplications()
    }
  }

  const handleReject = async (doctorId: string) => {
    const reason = rejectionReason[doctorId]
    if (!reason || reason.trim() === "") {
      alert("প্রত্যাখ্যানের কারণ লিখুন")
      return
    }

    const { error } = await supabase
      .from("doctor_profiles")
      .update({
        verification_status: "rejected",
        rejection_reason: reason,
      })
      .eq("id", doctorId)

    if (!error) {
      alert("Application প্রত্যাখ্যাত হয়েছে")
      loadApplications()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ডাক্তার Verification</h1>
          <p className="text-muted-foreground">Pending doctor applications review করুন</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">কোনো pending application নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{app.user_profiles.full_name}</CardTitle>
                      <CardDescription>{app.specialization}</CardDescription>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">BMDC Number</p>
                      <p className="font-semibold">{app.bmdc_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                      <p className="font-semibold">{app.qualification}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="font-semibold">{app.experience_years} বছর</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consultation Fee</p>
                      <p className="font-semibold">৳{app.consultation_fee}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
                    <p className="text-sm">{app.bio}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`reason-${app.id}`}>প্রত্যাখ্যানের কারণ (যদি reject করতে চান)</Label>
                      <Textarea
                        id={`reason-${app.id}`}
                        placeholder="BMDC number verify করা যায়নি..."
                        value={rejectionReason[app.id] || ""}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [app.id]: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(app.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        অনুমোদন করুন
                      </Button>
                      <Button onClick={() => handleReject(app.id)} variant="destructive" className="flex-1">
                        প্রত্যাখ্যান করুন
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
