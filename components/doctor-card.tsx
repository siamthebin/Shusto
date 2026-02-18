"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { WebRTCVideoCall } from "@/components/webrtc-video-call"
import { createBrowserClient } from "@/lib/supabase-browser"
import { SuccessModal } from "@/components/success-modal"
import { ErrorModal } from "@/components/error-modal"

interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  bmdc_number: string
  experience_years: number
  consultation_fee: number
  photo_url?: string
  phone_number?: string
}

interface DoctorCardProps {
  doctor: Doctor
  isAdmin?: boolean
}

export default function DoctorCard({ doctor, isAdmin }: DoctorCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorDetails, setErrorDetails] = useState("")

  const [name, setName] = useState(doctor.name)
  const [email, setEmail] = useState(doctor.email)
  const [specialty, setSpecialty] = useState(doctor.specialty)
  const [bmdcNumber, setBmdcNumber] = useState(doctor.bmdc_number)
  const [experience, setExperience] = useState(doctor.experience_years.toString())
  const [price, setPrice] = useState(doctor.consultation_fee.toString())
  const [photoUrl, setPhotoUrl] = useState(doctor.photo_url || "")
  const [phoneNumber, setPhoneNumber] = useState(doctor.phone_number || "")

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showBookingConfirm, setShowBookingConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে এই ডাক্তারকে মুছে ফেলতে চান?")) return

    setIsDeleting(true)
    try {
      console.log("[v0] Deleting doctor with ID:", doctor.id)

      const response = await fetch(`/api/admin/delete-doctor?id=${doctor.id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("[v0] Delete response:", result)

      if (response.ok) {
        alert("ডাক্তার সফলভাবে মুছে ফেলা হয়েছে")
        window.location.reload()
      } else {
        alert(`ডাক্তার মুছতে ব্যর্থ: ${result.error || "অজানা ত্রুটি"}`)
      }
    } catch (error) {
      console.error("[v0] Error deleting doctor:", error)
      alert("ডাক্তার মুছতে সমস্যা হয়েছে")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = async () => {
    if (!name || !email || !specialty) {
      alert("নাম, ইমেইল এবং বিশেষত্ব ফিল্ড অবশ্যই পূরণ করতে হবে")
      return
    }

    setIsSaving(true)
    try {
      console.log("[v0] Updating doctor with data:", {
        id: doctor.id,
        name,
        email,
        specialty,
        bmdcNumber,
        experience,
        price,
        photoUrl,
        phoneNumber,
      })

      const response = await fetch("/api/admin/update-doctor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doctor.id,
          name,
          email,
          specialty,
          bmdcNumber,
          experience,
          price,
          photoUrl,
          phoneNumber,
        }),
      })

      const result = await response.json()
      console.log("[v0] Update response:", result)

      if (response.ok) {
        alert("ডাক্তার সফলভাবে আপডেট করা হয়েছে")
        setIsEditOpen(false)
        window.location.reload()
      } else {
        alert(result.error || "আপডেট করতে ব্যর্থ")
      }
    } catch (error) {
      console.error("[v0] Error updating doctor:", error)
      alert("ডাক্তার আপডেট করতে সমস্যা হয়েছে")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoClick = () => {
    if (isAdmin) {
      fileInputRef.current?.click()
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("ছবির আকার ৫MB এর কম হতে হবে")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("শুধুমাত্র ছবি ফাইল আপলোড করা যাবে")
      return
    }

    setIsUploadingPhoto(true)
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result as string

        console.log("[v0] Uploading photo for doctor:", doctor.id)

        const response = await fetch("/api/admin/update-doctor", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty,
            bmdcNumber: doctor.bmdc_number,
            experience: doctor.experience_years.toString(),
            price: doctor.consultation_fee.toString(),
            photoUrl: base64Image,
            phoneNumber: doctor.phone_number,
          }),
        })

        const result = await response.json()
        console.log("[v0] Photo upload response:", result)

        if (response.ok) {
          alert("ছবি সফলভাবে আপলোড হয়েছে")
          window.location.reload()
        } else {
          alert(result.error || "ছবি আপলোড করতে ব্যর্থ")
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("[v0] Error uploading photo:", error)
      alert("ছবি আপলোড করতে সমস্যা হয়েছে")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleStartVideoCall = async () => {
    try {
      console.log("[v0] Starting video call with doctor:", {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
      })

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          patient_name: "Guest Patient",
          patient_email: `guest${Date.now()}@shusto.com`,
          patient_phone: "01700000000",
          appointment_date: new Date().toISOString().split("T")[0],
          appointment_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
          symptoms: "Quick video consultation",
          status: "confirmed",
          payment_status: "paid",
        }),
      })

      const data = await response.json()
      console.log("[v0] Appointment response:", data)

      if (response.ok && data.id) {
        console.log("[v0] Appointment created successfully! ID:", data.id, "Doctor ID:", data.doctor_id)
        setAppointmentId(data.id)
        setIsVideoCallActive(true)
      } else {
        console.error("[v0] Failed to create appointment:", data.error)
        alert(data.error || "Video call শুরু করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      console.error("[v0] Video call start error:", error)
      alert("Video call শুরু করতে সমস্যা হয়েছে")
    }
  }

  const handleBookingClick = () => {
    setShowBookingConfirm(true)
  }

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true)

      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !user.email) {
        setErrorMessage("অ্যাপয়েন্টমেন্ট বুক করতে আগে লগইন করুন")
        setErrorDetails("দয়া করে আপনার অ্যাকাউন্টে লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন")
        setShowErrorModal(true)
        setShowBookingConfirm(false)
        setIsBooking(false)
        return
      }

      const patientName = user?.user_metadata?.full_name || user.email.split("@")[0]
      const patientEmail = user.email // Now guaranteed to exist

      const now = new Date()
      const safeTime = now.toTimeString().split(" ")[0] // HH:MM:SS format

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          patient_name: patientName,
          patient_email: patientEmail, // Will never be null now
          patient_phone: "01700000000",
          appointment_date: now.toISOString().split("T")[0],
          appointment_time: safeTime,
          symptoms: "General Consultation Request",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setBookingSuccess(true)
        setShowBookingConfirm(false)
        setTimeout(() => setBookingSuccess(false), 3000)
      } else {
        throw new Error(result.error || result.details || "Booking failed")
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      setErrorMessage(`সমস্যা: ${error.message || "অজানা ত্রুটি"}`)
      setShowErrorModal(true)
      setShowBookingConfirm(false)
    } finally {
      setIsBooking(false)
    }
  }

  useState(() => {
    const checkIfUserIsDoctor = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user?.email) {
          const response = await fetch(`/api/doctors/check?email=${encodeURIComponent(user.email)}`)
          const data = await response.json()
          console.log("[v0] 🔍 Initial doctor check:", user.email, "isDoctor:", data.isDoctor)
          // setIsCurrentUserDoctor(data.isDoctor)
        }
      } catch (error) {
        console.error("[v0] Error checking if user is doctor:", error)
      } finally {
        // setIsCheckingUser(false)
      }
    }

    checkIfUserIsDoctor()
  }, [])

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100">
        {/* Doctor Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-emerald-50">
          <img
            src={doctor.photo_url || "/professional-doctor.jpg"}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
          {isAdmin && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center group cursor-pointer"
              >
                <div className="bg-white rounded-full p-4 transform group-hover:scale-110 transition-transform">
                  {isUploadingPhoto ? (
                    <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l3-2.647A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l3 2.647A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2 2v-9a2 2 0 012-2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </>
          )}
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold text-sm">5.0</span>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
          <p className="text-emerald-600 font-medium mb-2">{doctor.specialty}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>অভিজ্ঞতা: {doctor.experience_years} বছর</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold text-emerald-700">পরামর্শ ফি: ৳{doctor.consultation_fee}</span>
            </div>
            {doctor.bmdc_number && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>BMDC: {doctor.bmdc_number}</span>
              </div>
            )}
            {doctor.phone_number && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>ফোন নম্বর: {doctor.phone_number}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {isAdmin && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
            {!isAdmin && (
              <Button
                onClick={handleBookingClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
              >
                📅 পরামর্শ বুক করুন
              </Button>
            )}
          </div>
        </div>
      </div>

      {isVideoCallActive && appointmentId && (
        <WebRTCVideoCall appointmentId={appointmentId} role="patient" onCallEnd={() => setIsVideoCallActive(false)} />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">ডাক্তারের তথ্য সম্পাদনা করুন</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">নাম</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">নাম পরিবর্তন করা যাবে না</p>
            </div>

            <div>
              <Label htmlFor="edit-email">ইমেইল</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
            </div>

            <div>
              <Label htmlFor="edit-specialty">বিশেষত্ব</Label>
              <Input
                id="edit-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-bmdc">BMDC নম্বর</Label>
              <Input
                id="edit-bmdc"
                value={bmdcNumber}
                onChange={(e) => setBmdcNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-experience">অভিজ্ঞতা (বছর)</Label>
              <Input
                id="edit-experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-price">পরামর্শ ফি (টাকা)</Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-photo">ছবি URL</Label>
              <Input
                id="edit-photo"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/doctor-photo.jpg"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">ডাক্তারের ছবির লিংক দিন</p>
            </div>

            <div>
              <Label htmlFor="edit-phone">ফোন নম্বর</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01712345678"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">ডাক্তারের মোবাইল নম্বর দিন</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingConfirm} onOpenChange={setShowBookingConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>অ্যাপয়েন্টমেন্ট নিশ্চিত করুন</DialogTitle>
            <DialogDescription>আপনি কি {doctor.name} এর সাথে পরামর্শের জন্য অ্যাপয়েন্টমেন্ট বুক করতে চান?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowBookingConfirm(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isBooking ? "বুকিং হচ্ছে..." : "নিশ্চিত করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={bookingSuccess}
        onClose={() => setBookingSuccess(false)}
        title="সফল!"
        message="আপনার অ্যাপয়েন্টমেন্ট অনুরোধ পাঠানো হয়েছে। ডাক্তার শীঘ্রই আপনার সাথে যোগাযোগ করবেন।"
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="ত্রুটি"
        message={errorMessage}
        details={errorDetails}
      />
    </>
  )
}
