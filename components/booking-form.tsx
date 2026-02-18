"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    patient_name: string
    patient_email: string
    patient_phone: string
    appointment_date: string
    appointment_time: string
    symptoms: string
  }) => void
  isLoading?: boolean
}

export function BookingForm({ isOpen, onClose, onSubmit, isLoading }: BookingFormProps) {
  const [patientName, setPatientName] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [symptoms, setSymptoms] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientName || !patientEmail || !patientPhone || !appointmentDate || !appointmentTime) {
      alert("সব ফিল্ড পূরণ করুন")
      return
    }

    onSubmit({
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: patientPhone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      symptoms: symptoms || "সাধারণ পরামর্শ",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">অ্যাপয়েন্টমেন্ট বুক করুন</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="patient_name">আপনার নাম *</Label>
            <Input
              id="patient_name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="আপনার পূর্ণ নাম লিখুন"
              required
            />
          </div>

          <div>
            <Label htmlFor="patient_email">ইমেইল *</Label>
            <Input
              id="patient_email"
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="patient_phone">ফোন নম্বর *</Label>
            <Input
              id="patient_phone"
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="appointment_date">তারিখ *</Label>
            <Input
              id="appointment_date"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="appointment_time">সময় *</Label>
            <Input
              id="appointment_time"
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="symptoms">লক্ষণ / সমস্যা</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="আপনার স্বাস্থ্য সমস্যা বা লক্ষণ লিখুন..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              বাতিল
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? "সংরক্ষণ করা হচ্ছে..." : "বুক করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
