"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Users,
  Video,
  Clock,
  CheckCircle,
  Bell,
  Phone,
  Check,
  ArrowLeft,
  RefreshCw,
  FileText,
  Plus,
  X,
  History,
  Volume2,
  VolumeX,
} from "lucide-react"
import { DoctorPrescriptionForm } from "@/components/doctor-prescription-form"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { VideoCallInterface } from "@/components/video-call-interface"

interface Prescription {
  id: number
  patient_name: string
  patient_email: string
  diagnosis: string
  medicines: { name: string; dosage: string; duration: string }[]
  instructions: string
  follow_up_date: string | null
  created_at: string
}

export default function DoctorPortalDashboard() {
  const [doctor, setDoctor] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null)
  const [activeCallAppointment, setActiveCallAppointment] = useState<any>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [prescriptionAppointment, setPrescriptionAppointment] = useState<any>(null)
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    medicines: [{ name: "", dosage: "", duration: "" }],
    instructions: "",
    followUpDate: "",
  })
  const [submittingPrescription, setSubmittingPrescription] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<"appointments" | "prescriptions" | "history">("appointments")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string>("")
  const [prescriptionHistory, setPrescriptionHistory] = useState<Prescription[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 1.0
    audioRef.current.loop = false
    
    // Load sound preference
    const savedPref = localStorage.getItem("shusto_doctor_sound")
    if (savedPref !== null) {
      setSoundEnabled(savedPref === "true")
    }
    
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
      }
    }
  }, [])

  // Play notification sound repeatedly for new appointments
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log("[v0] Audio play failed:", err)
      })
    }
  }, [soundEnabled])

  // Toggle sound
  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem("shusto_doctor_sound", String(newValue))
    
    if (newValue && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const storedEmail = localStorage.getItem("doctorEmail")
      if (storedEmail) {
        fetchDoctorData(storedEmail)
        fetchAppointments()
        setIsLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/doctor-portal/login")
        return
      }

      const userEmail = session.user.email
      if (userEmail) {
        localStorage.setItem("doctorEmail", userEmail)
        localStorage.setItem("userEmail", userEmail)
        fetchDoctorData(userEmail)
      }

      fetchAppointments()
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchDoctorData = async (email: string) => {
    const response = await fetch(`/api/admin/get-doctor-by-email?email=${encodeURIComponent(email)}`)
    const doctorData = await response.json()

    if (doctorData.doctor) {
      setDoctor(doctorData.doctor)
    }
  }

  const fetchAppointments = async () => {
    try {
      setRefreshing(true)
      const email = doctor?.email || localStorage.getItem("doctorEmail") || "unknown"

      const response = await fetch(`/api/appointments/doctor?doctor_email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok && data) {
        const appointmentsData = Array.isArray(data) ? data : []
        setAppointments(appointmentsData)

        const pending = appointmentsData.filter((apt: any) => apt.status === "pending")

        const pendingAppointment = pending.find((apt: any) => {
          const createdAt = new Date(apt.created_at)
          const now = new Date()
          const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000
          const isNew = apt.status === "pending" && diffSeconds < 60
          return isNew
        })

        if (pendingAppointment && (!incomingCall || incomingCall.id !== pendingAppointment.id)) {
          setIncomingCall(pendingAppointment)

          // Play notification sound
          playNotificationSound()
          
          // Set up repeated sound every 5 seconds while there's a pending appointment
          if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current)
          }
          notificationIntervalRef.current = setInterval(() => {
            if (soundEnabled) {
              playNotificationSound()
            }
          }, 5000)
        } else if (!pendingAppointment && notificationIntervalRef.current) {
          // Clear interval when no pending appointments
          clearInterval(notificationIntervalRef.current)
          notificationIntervalRef.current = null
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching appointments:", error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (doctor) {
      fetchAppointments()
    }
  }, [doctor])

  const handleAccept = async (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowConfirmDialog(true)
  }

  const confirmApproval = async () => {
    if (!selectedAppointment) {
      toast({
        title: "সতর্কতা",
        description: "অ্যাপয়েন্টমেন্ট নির্বাচন করুন",
        variant: "destructive",
      })
      return
    }

    setConfirmError("")
    const meetingTime = selectedTime || new Date().toISOString()
    setIsConfirming(true)

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          meeting_time: meetingTime,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm appointment")
      }

      setShowConfirmDialog(false)
      setSelectedAppointment(null)
      setSelectedTime("")

      toast({
        title: "✅ সফল!",
        description: `${selectedAppointment.patient_name} এর অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে`,
        className: "bg-emerald-500 text-white border-emerald-600",
        duration: 5000,
      })

      await fetchAppointments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "অ্যাপয়েন্টমেন্ট নিশ্চিত করতে সমস্যা হয়েছে"
      setConfirmError(errorMessage)
      toast({
        title: "ত্রুটি",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/doctor-portal/login")
  }

  const isAppointmentTimeNow = (appointmentTime: string) => {
    if (!appointmentTime) return true // If no time set, allow call

    const now = new Date()
    const aptTime = new Date(appointmentTime)
    const diffMinutes = Math.abs(now.getTime() - aptTime.getTime()) / (1000 * 60)

    // Allow call within 15 minutes before or after appointment time
    return diffMinutes <= 15
  }

  const startVideoCall = async (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (appointment && isAppointmentTimeNow(appointment.meeting_time)) {
      try {
        // Send signal to notify patient
        await fetch("/api/video-call/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: appointmentId,
            type: "start-call",
            role: "doctor",
            data: { doctorStarted: true },
          }),
        })

        // Navigate doctor to video call page with room ID
        if (appointment.video_room_id) {
          window.location.href = `/video-call?room=${appointment.video_room_id}`
        }
      } catch (error) {
        console.error("[v0] Error sending call signal:", error)
      }
    } else {
      toast({
        title: "ত্রুটি",
        description: "মিটিং সময় সামন্দরে নেই",
        variant: "destructive",
      })
    }
  }

  const handleSubmitPrescription = async () => {
    if (!prescriptionAppointment || !doctor) return

    try {
      setSubmittingPrescription(true)

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: prescriptionAppointment.id,
          doctor_id: doctor.id,
          patient_email: prescriptionAppointment.patient_email,
          patient_name: prescriptionAppointment.patient_name,
          diagnosis: prescriptionForm.diagnosis,
          medicines: prescriptionForm.medicines.filter((m) => m.name.trim() !== ""),
          instructions: prescriptionForm.instructions,
          follow_up_date: prescriptionForm.followUpDate || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "সফল!",
          description: "প্রেসক্রিপশন সফলভাবে পাঠানো হয়েছে!",
          className: "bg-emerald-500 text-white border-emerald-600",
        })
        setShowPrescriptionDialog(false)
        setPrescriptionForm({
          diagnosis: "",
          medicines: [{ name: "", dosage: "", duration: "" }],
          instructions: "",
          followUpDate: "",
        })
      } else {
        toast({
          title: "ত্রুটি",
          description: "প্রেসক্রিপশন পাঠাতে ব্যর্থ হয়েছে",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting prescription:", error)
      toast({
        title: "ত্রুটি",
        description: "প্রেসক্রিপশন পাঠাতে ত্রুটি হয়েছে",
        variant: "destructive",
      })
    } finally {
      setSubmittingPrescription(false)
    }
  }

  const addMedicineRow = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [...prescriptionForm.medicines, { name: "", dosage: "", duration: "" }],
    })
  }

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = [...prescriptionForm.medicines]
    newMedicines[index] = { ...newMedicines[index], [field]: value }
    setPrescriptionForm({ ...prescriptionForm, medicines: newMedicines })
  }

  const removeMedicine = (index: number) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: prescriptionForm.medicines.filter((_, i) => i !== index),
    })
  }

  useEffect(() => {
    console.log("[v0] selectedTime changed:", selectedTime, "isEmpty:", !selectedTime)
  }, [selectedTime])

  const fetchPrescriptionHistory = async () => {
    console.log("[v0] fetchPrescriptionHistory called, doctor:", doctor)

    if (!doctor?.id) {
      console.log("[v0] No doctor.id found")
      return
    }

    try {
      setLoadingHistory(true)
      const url = `/api/prescriptions?doctor_id=${doctor.id}`
      console.log("[v0] Fetching from:", url)

      const response = await fetch(url)
      const data = await response.json()

      console.log("[v0] Prescription history response:", data)

      if (data.prescriptions && Array.isArray(data.prescriptions)) {
        setPrescriptionHistory(data.prescriptions)
        console.log("[v0] Set prescription history:", data.prescriptions.length, "items")
      } else {
        console.log("[v0] No prescriptions array in response")
        setPrescriptionHistory([])
      }
    } catch (error) {
      console.error("[v0] Error fetching prescription history:", error)
      toast({
        title: "ত্রুটি",
        description: "প্রেসক্রিপশন হিস্ট্রি লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === "history" && doctor?.id) {
      fetchPrescriptionHistory()
    }
  }, [activeTab, doctor?.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  const confirmedAppointments = appointments.filter((apt) => apt.status === "confirmed")
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")
  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/")} className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-green-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-green-900">{doctor?.name || "ডাক্তার"}</h1>
                <p className="text-sm text-green-600">{doctor?.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sound Toggle Button */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                title={soundEnabled ? "Sound On" : "Sound Off"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === "appointments"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                অ্যাপয়েন্টমেন্ট
              </button>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === "prescriptions"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                প্রেসক্রিপশন লিখুন
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-1 ${
                  activeTab === "history" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                <History className="w-4 h-4" />
                হিস্ট্রি
              </button>
              <Button
                onClick={fetchAppointments}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer active:bg-green-800 disabled:opacity-70 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                রিফ্রেশ
              </Button>
            </div>
          </div>
        </div>
      </header>

      {incomingCall && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 slide-in-from-top-10 duration-500 border-2 border-emerald-200">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-900">🔔 নতুন অনুরোধ</CardTitle>
              <CardDescription className="text-lg mt-2 text-gray-700">
                <span className="font-semibold text-emerald-700">{incomingCall.patient_name}</span> আপনার সাথে পরামর্শ নিতে
                চান
              </CardDescription>
              <div className="mt-4 space-y-2 text-left bg-white rounded-xl p-4 shadow-inner border border-emerald-100">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">ফোন:</span> {incomingCall.patient_phone}
                </p>
                <p className="text-sm text-gray-700 break-all">
                  <span className="font-semibold">ইমেইল:</span> {incomingCall.patient_email}
                </p>
                {incomingCall.symptoms && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">সমস্যা:</span> {incomingCall.symptoms}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAccept(incomingCall)}
                  className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  অনুমোদন করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showConfirmDialog && selectedAppointment && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 slide-in-from-top-10 duration-500 border-2 border-emerald-200">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-900">মিটিং এর সময় নির্ধারণ করুন</CardTitle>
              <CardDescription className="text-lg mt-2 text-gray-700">
                <span className="font-semibold text-emerald-700">{selectedAppointment.patient_name}</span> এর সাথে কখন
                মিট করবেন?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {confirmError && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-red-700 text-sm font-medium">
                  ত্রুটি: {confirmError}
                </div>
              )}
              <div className="space-y-3">
                <label className="text-sm font-medium">সময় নির্বাচন করুন</label>
                <input
                  type="datetime-local"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-base"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setSelectedAppointment(null)
                    setSelectedTime("")
                    setConfirmError("")
                  }}
                  variant="outline"
                  className="flex-1 h-12 text-base border-2 border-gray-300 hover:bg-gray-100 font-semibold"
                  disabled={isConfirming}
                >
                  বাতিল
                </Button>
                <Button
                  onClick={confirmApproval}
                  disabled={isConfirming}
                  className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md font-semibold disabled:opacity-50"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {isConfirming ? "অপেক্ষা করুন..." : "নিশ্চিত করুন"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeVideoCall && activeCallAppointment && (
        <VideoCallInterface
          appointmentId={activeVideoCall}
          patientName={activeCallAppointment.patient_name}
          onEndCall={() => {
            setActiveVideoCall(null)
            setActiveCallAppointment(null)
          }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "appointments" ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-50 to-teal-50 bg-clip-text text-transparent mb-2">
                স্বাগতম, {doctor?.name || "ডাক্তার"}!
              </h1>
              <p className="text-gray-600 text-lg">
                আজকের আপনার{" "}
                <span className="font-bold text-emerald-600">
                  {pendingAppointments.length + confirmedAppointments.length + completedAppointments.length}টি
                </span>{" "}
                অ্যাপয়েন্টমেন্ট আছে
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-amber-700">অপেক্ষমাণ</CardTitle>
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-amber-600">{pendingAppointments.length}</div>
                  <p className="text-xs text-amber-600 mt-1">অনুমোদনের জন্য অপেক্ষা করছে</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-emerald-700">অনুমোদিত</CardTitle>
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-emerald-600">{confirmedAppointments.length}</div>
                  <p className="text-xs text-emerald-600 mt-1">কল এর জন্য প্রস্তুত</p>
                </CardContent>
              </Card>
            </div>

            {pendingAppointments.length > 0 && (
              <Card className="border-2 border-amber-200 shadow-lg mb-8">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                  <CardTitle className="text-2xl flex items-center gap-3 text-amber-800">
                    <div className="w-10 h-10 bg-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    অপেক্ষমাণ অ্যাপয়েন্টমেন্ট রিকোয়েস্ট
                  </CardTitle>
                  <CardDescription className="mt-2 text-amber-700 font-medium">
                    রোগীরা আপনার অনুমোদনের জন্য অপেক্ষা করছে
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 border-2 border-amber-200 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{appointment.patient_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.patient_email}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="w-4 h-4" />
                              {appointment.patient_phone}
                            </p>
                            {appointment.symptoms && (
                              <p className="text-sm text-amber-700 mt-2 bg-white/70 px-3 py-1 rounded-lg">
                                <span className="font-semibold">সমস্যা:</span> {appointment.symptoms}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => handleAccept(appointment)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            অনুমোদন করুন
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <CardTitle className="text-2xl flex items-center gap-3 text-emerald-800">
                  <div className="w-10 h-10 bg-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  অনুমোদিত অ্যাপয়েন্টমেন্ট
                </CardTitle>
                <CardDescription className="mt-2 text-emerald-700 font-medium">
                  ভিডিও কল শুরু করার জন্য প্রস্তুত
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {confirmedAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">কোনো অনুমোদিত অ্যাপয়েন্টমেন্ট নেই</p>
                    <p className="text-gray-400 text-sm mt-2">নতুন অনুরোধ অনুমোদন করুন</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {confirmedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 border-2 border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{appointment.patient_name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                {new Date(appointment.created_at).toLocaleTimeString("bn-BD", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {appointment.symptoms && (
                                <span className="text-gray-700">সমস্যা: {appointment.symptoms}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                          <Button
                            onClick={() => startVideoCall(appointment.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            ভিডিও কল শুরু করুন
                          </Button>
                          <Button
                            onClick={() => {
                              setPrescriptionAppointment(appointment)
                              setShowPrescriptionDialog(true)
                            }}
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            প্রেসক্রিপশন লিখুন
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : activeTab === "prescriptions" ? (
          <DoctorPrescriptionForm />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">প্রেসক্রিপশন হিস্ট্রি</h2>
                <p className="text-gray-600 mt-1">আপনার দেওয়া সকল প্রেসক্রিপশনের তালিকা</p>
              </div>
              <Button
                onClick={fetchPrescriptionHistory}
                disabled={loadingHistory}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? "animate-spin" : ""}`} />
                রিফ্রেশ
              </Button>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : prescriptionHistory.length === 0 ? (
              <Card className="border-2 border-gray-200">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">কোনো প্রেসক্রিপশন পাওয়া যায়নি</p>
                  <p className="text-gray-400 text-sm mt-2">আপনি এখনো কোনো প্রেসক্রিপশন দেননি</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prescriptionHistory.map((prescription) => (
                  <Card
                    key={prescription.id}
                    className="border-2 border-emerald-100 hover:border-emerald-200 transition-colors"
                  >
                    <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{prescription.patient_name}</CardTitle>
                            <CardDescription>{prescription.patient_email}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-emerald-700">
                            {new Date(prescription.created_at).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(prescription.created_at).toLocaleTimeString("bn-BD", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {prescription.diagnosis && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">রোগ নির্ণয়</h4>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{prescription.diagnosis}</p>
                        </div>
                      )}

                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">ওষুধের তালিকা</h4>
                          <div className="space-y-2">
                            {prescription.medicines.map((medicine, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{medicine.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {medicine.dosage} • {medicine.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prescription.instructions && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">নির্দেশনা</h4>
                          <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                            {prescription.instructions}
                          </p>
                        </div>
                      )}

                      {prescription.follow_up_date && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">ফলোআপ:</span>
                          <span>
                            {new Date(prescription.follow_up_date).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-800">প্রেসক্রিপশন লিখুন</DialogTitle>
            <DialogDescription>
              {prescriptionAppointment && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">রোগীর নাম: {prescriptionAppointment.patient_name}</p>
                  <p>ইমেইল: {prescriptionAppointment.patient_email}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">রোগ নির্ণয়</label>
              <textarea
                value={prescriptionForm.diagnosis}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="রোগ নির্ণয় লিখুন..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">ওষুধের তালিকা</label>
                <Button
                  onClick={addMedicineRow}
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  ওষুধ যোগ করুন
                </Button>
              </div>

              {prescriptionForm.medicines.map((medicine, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="ওষুধের নাম"
                  />
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="ডোজ"
                  />
                  <input
                    type="text"
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded-md"
                  />
                  {prescriptionForm.medicines.length > 1 && (
                    <Button
                      onClick={() => removeMedicine(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">নির্দেশনা</label>
              <textarea
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="রোগীর জন্য নির্দেশনা লিখুন..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ফলোআপ তারিখ (ঐচ্ছিক)</label>
              <input
                type="date"
                value={prescriptionForm.followUpDate}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPrescriptionDialog(false)}
              disabled={submittingPrescription}
            >
              বাতিল করুন
            </Button>
            <Button
              onClick={handleSubmitPrescription}
              disabled={submittingPrescription || !prescriptionForm.diagnosis}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submittingPrescription ? "পাঠানো হচ্ছে..." : "প্রেসক্রিপশন পাঠান"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
