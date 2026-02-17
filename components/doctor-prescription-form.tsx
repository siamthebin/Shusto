"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Send, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Medication {
  name: string
  dosage: string
  timing: string
  duration: string
}

export function DoctorPrescriptionForm() {
  const [patientEmail, setPatientEmail] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [medications, setMedications] = useState<Medication[]>([{ name: "", dosage: "", timing: "", duration: "" }])
  const [instructions, setInstructions] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null)
  const { toast } = useToast()

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", timing: "", duration: "" }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientEmail || !diagnosis) {
      toast({
        title: "ত্রুটি",
        description: "রোগীর ইমেইল এবং রোগ নির্ণয় আবশ্যক",
        variant: "destructive",
      })
      return
    }

    const validMedications = medications.filter((med) => med.name && med.dosage)

    if (validMedications.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "কমপক্ষে একটি ঔষধ যোগ করুন",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        patient_email: patientEmail,
        patient_name: patientEmail.split("@")[0],
        doctor_id: 1,
        diagnosis,
        medicines: validMedications,
        instructions,
        follow_up_date: followUpDate || null,
      }

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details?.includes("relation") || data.details?.includes("does not exist")) {
          throw new Error("⚠️ Database table নেই! প্রথমে /api/setup-prescriptions-table ভিজিট করুন")
        }
        throw new Error(data.error || data.details || "Failed to create prescription")
      }

      setPrescriptionId(data.prescription?.id || null)
      setShowSuccessModal(true)

      setPatientEmail("")
      setDiagnosis("")
      setMedications([{ name: "", dosage: "", timing: "", duration: "" }])
      setInstructions("")
      setFollowUpDate("")
    } catch (error) {
      console.error("[v0] Prescription submission error:", error)
      toast({
        title: "ত্রুটি",
        description: error instanceof Error ? error.message : "প্রেসক্রিপশন পাঠাতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6" />
            প্রেসক্রিপশন লিখুন
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-6">
              {/* Patient Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">রোগীর ইমেইল *</label>
                <p className="text-xs text-gray-600 mb-2">
                  ⚠️ রোগীর সঠিক ইমেইল লিখুন - এই ইমেইল দিয়ে রোগী লগইন করবে (যেমন: thesiambin@gmail.com)
                </p>
                <Input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  className="w-full text-black placeholder:text-gray-400 border-2 border-gray-300"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">রোগ নির্ণয় *</label>
                <Input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="যেমন: জ্বর, সর্দি-কাশি"
                  required
                  className="w-full text-black placeholder:text-gray-400 border-2 border-gray-300"
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">ঔষধ *</label>
                  <Button
                    type="button"
                    onClick={addMedication}
                    size="sm"
                    className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4" />
                    ঔষধ যোগ করুন
                  </Button>
                </div>

                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2 relative border-2 border-gray-200">
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="ঔষধের নাম"
                          value={med.name}
                          onChange={(e) => updateMedication(index, "name", e.target.value)}
                          required
                          className="text-sm text-black placeholder:text-gray-400 border-2 border-gray-300"
                        />
                        <Input
                          placeholder="ডোজ (যেমন: 500mg)"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                          required
                          className="text-sm text-black placeholder:text-gray-400 border-2 border-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="সময় (যেমন: দিনে ৩ বার)"
                          value={med.timing}
                          onChange={(e) => updateMedication(index, "timing", e.target.value)}
                          className="text-sm text-black placeholder:text-gray-400 border-2 border-gray-300"
                        />
                        <Input
                          placeholder="মেয়াদ (যেমন: ৭ দিন)"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, "duration", e.target.value)}
                          className="text-sm text-black placeholder:text-gray-400 border-2 border-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">নির্দেশাবলী</label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="বিশেষ নির্দেশাবলী লিখুন..."
                  rows={3}
                  className="w-full text-black placeholder:text-gray-400 border-2 border-gray-300"
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ফলো-আপ তারিখ</label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="text-black border-2 border-gray-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-200 mt-6">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    পাঠানো হচ্ছে...
                  </span>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    প্রেসক্রিপশন পাঠান
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">সফলভাবে পাঠানো হয়েছে!</h3>
                <p className="text-gray-600">প্রেসক্রিপশন রোগীর কাছে পাঠানো হয়েছে</p>
                <p className="text-sm text-teal-600 font-medium">{patientEmail || "রোগীর ইমেইল"}</p>
                {prescriptionId && <p className="text-xs text-gray-500">প্রেসক্রিপশন ID: #{prescriptionId}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-2 mt-4">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                >
                  নতুন প্রেসক্রিপশন লিখুন
                </Button>
                <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 hover:text-gray-700 py-2">
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
