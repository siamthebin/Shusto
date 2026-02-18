"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface Doctor {
  id: string
  name: string
  specialty: string
  consultation_fee: number
}

export default function BookingModal({
  doctor,
  onClose,
}: {
  doctor: Doctor
  onClose: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"booking" | "payment">("booking")
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  })

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          patient_name: formData.patientName,
          patient_email: formData.patientEmail,
          patient_phone: formData.patientPhone,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          symptoms: formData.symptoms,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "বুকিং সমস্যা হয়েছে")
      }

      setAppointmentId(data.id)
      setStep("payment")
    } catch (err) {
      console.error("[v0] Booking error:", err)
      setError(err instanceof Error ? err.message : "বুকিং সমস্যা হয়েছে")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      setError("পেমেন্ট মেথড নির্বাচন করুন")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (paymentMethod === "bkash") {
        const res = await fetch("/api/payment/bkash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: doctor.consultation_fee,
            invoiceNumber: `APP_${appointmentId}_${Date.now()}`,
            id_token: "PLACEHOLDER", // Will be fetched by the API
          }),
        })

        const data = await res.json()

        if (!data.bkashURL) {
          throw new Error("bKash পেমেন্ট URL তৈরি ব্যর্থ হয়েছে")
        }

        // Append appointment ID to callback URL
        const paymentUrl = `${data.bkashURL}&appointmentId=${appointmentId}&amount=${doctor.consultation_fee}`
        window.location.href = paymentUrl
      } else {
        const res = await fetch("/api/payment/nagad/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: doctor.consultation_fee,
            orderId: `APP_${appointmentId}_${Date.now()}`,
          }),
        })

        const data = await res.json()

        if (!data.paymentUrl) {
          throw new Error("Nagad পেমেন্ট URL তৈরি ব্যর্থ হয়েছে")
        }

        // Append appointment ID to callback
        const paymentUrl = `${data.paymentUrl}&appointmentId=${appointmentId}&amount=${doctor.consultation_fee}`
        window.location.href = paymentUrl
      }
    } catch (err) {
      console.error("[v0] Payment error:", err)
      setError(err instanceof Error ? err.message : "পেমেন্ট সমস্যা হয়েছে")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-900">
            {step === "booking" ? `${doctor.name} - এর সাথে পরামর্শ বুক করুন` : "পেমেন্ট করুন"}
          </DialogTitle>
          <DialogDescription className="text-base text-emerald-700">
            {doctor.specialty} • ৳{doctor.consultation_fee}
          </DialogDescription>
        </DialogHeader>

        {step === "booking" ? (
          <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="patientName" className="text-zinc-900 font-medium">
                আপনার নাম *
              </Label>
              <Input
                id="patientName"
                required
                className="mt-1.5 bg-white border-zinc-300"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="patientEmail" className="text-zinc-900 font-medium">
                ইমেইল *
              </Label>
              <Input
                id="patientEmail"
                type="email"
                required
                className="mt-1.5 bg-white border-zinc-300"
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="patientPhone" className="text-zinc-900 font-medium">
                ফোন নম্বর *
              </Label>
              <Input
                id="patientPhone"
                type="tel"
                required
                className="mt-1.5 bg-white border-zinc-300"
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentDate" className="text-zinc-900 font-medium">
                  তারিখ *
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  required
                  className="mt-1.5 bg-white border-zinc-300"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="appointmentTime" className="text-zinc-900 font-medium">
                  সময় *
                </Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  required
                  className="mt-1.5 bg-white border-zinc-300"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="symptoms" className="text-zinc-900 font-medium">
                আপনার সমস্যা বর্ণনা করুন
              </Label>
              <Textarea
                id="symptoms"
                rows={3}
                className="mt-1.5 bg-white border-zinc-300"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="আপনার উপসর্গ বা স্বাস্থ্য সমস্যা সম্পর্কে বলুন..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800 font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-zinc-300 hover:bg-zinc-100 bg-transparent"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? "প্রসেস হচ্ছে..." : "পরবর্তী: পেমেন্ট"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-900 font-semibold mb-1">পরামর্শ ফি</p>
              <p className="text-2xl font-bold text-emerald-600">৳{doctor.consultation_fee}</p>
              <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-800">ডাক্তার পাবেন (70%):</span>
                  <span className="font-semibold text-emerald-900">৳{(doctor.consultation_fee * 0.7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-800">প্ল্যাটফর্ম ফি (30%):</span>
                  <span className="font-semibold text-emerald-900">৳{(doctor.consultation_fee * 0.3).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block text-zinc-900">পেমেন্ট মেথড নির্বাচন করুন *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === "bkash"
                      ? "border-pink-600 bg-pink-50 text-pink-900"
                      : "border-zinc-300 hover:border-zinc-400 bg-white"
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("nagad")}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === "nagad"
                      ? "border-orange-600 bg-orange-50 text-orange-900"
                      : "border-zinc-300 hover:border-zinc-400 bg-white"
                  }`}
                >
                  Nagad
                </button>
              </div>
            </div>

            {paymentMethod && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">পেমেন্ট প্রক্রিয়া:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>{paymentMethod === "bkash" ? "bKash" : "Nagad"} পেমেন্ট গেটওয়ে তে রিডাইরেক্ট হবে</li>
                  <li>পেমেন্ট সম্পন্ন করুন</li>
                  <li>স্বয়ংক্রিয়ভাবে অ্যাপয়েন্টমেন্ট নিশ্চিত হবে</li>
                </ol>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800 font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("booking")}
                className="flex-1 border-zinc-300 hover:bg-zinc-100"
              >
                পিছনে
              </Button>
              <Button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={isLoading || !paymentMethod}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-zinc-300"
              >
                {isLoading ? "রিডাইরেক্ট হচ্ছে..." : `${paymentMethod === "bkash" ? "bKash" : "Nagad"} দিয়ে পেমেন্ট করুন`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
