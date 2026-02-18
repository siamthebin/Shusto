"use client"

import { useEffect, useRef, useState, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Camera, Mic, RefreshCw, Video, Phone } from "lucide-react"

const AGORA_APP_ID = "e66b5e13d30b4844b6f95ad4b9cd7572"

function VideoCallContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams.get("room") || searchParams.get("roomId") || "shusto-default"
  const role = searchParams.get("role") === "doctor" ? "doctor" : "patient"

  // Permission states
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [checkingPermission, setCheckingPermission] = useState(true)

  // Call states
  const [joined, setJoined] = useState(false)
  const [connected, setConnected] = useState(false)
  const [remoteUserExists, setRemoteUserExists] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [status, setStatus] = useState("সংযোগ করা হচ্ছে...")
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStep, setConnectionStep] = useState("")

  // Refs
  const clientRef = useRef<any>(null)
  const localVideoTrackRef = useRef<any>(null)
  const localAudioTrackRef = useRef<any>(null)
  const remoteUserRef = useRef<any>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setPermissionGranted(true)
        setPermissionDenied(false)
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionDenied(true)
        }
      }
      setCheckingPermission(false)
    }
    checkPermission()
  }, [])

  const requestPermission = async () => {
    try {
      setCheckingPermission(true)
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      stream.getTracks().forEach((track) => track.stop())
      setPermissionGranted(true)
      setPermissionDenied(false)
    } catch (err: any) {
      setPermissionDenied(true)
      if (err.name === "NotAllowedError") {
        setError("ক্যামেরা/মাইক অনুমতি দেওয়া হয়নি।")
      } else if (err.name === "NotFoundError") {
        setError("ক্যামেরা বা মাইক পাওয়া যায়নি।")
      } else {
        setError("ক্যামেরা/মাইক চালু করতে সমস্যা।")
      }
    } finally {
      setCheckingPermission(false)
    }
  }

  const initAndJoinAgora = useCallback(async () => {
    if (!permissionGranted || isConnecting || joined) return

    setIsConnecting(true)
    setError(null)
    setConnectionStep("SDK লোড হচ্ছে...")

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default
      AgoraRTC.setLogLevel(4)

      setConnectionStep("ক্লায়েন্ট তৈরি হচ্ছে...")

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      clientRef.current = client

      client.on("user-published", async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType)
        if (mediaType === "video") {
          remoteUserRef.current = user
          setRemoteUserExists(true)
          setConnected(true)
          setStatus("সংযুক্ত!")
          setConnectionStep("")
          if (remoteVideoRef.current && user.videoTrack) {
            user.videoTrack.play(remoteVideoRef.current)
          }
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play()
        }
      })

      client.on("user-unpublished", (user: any, mediaType: string) => {
        if (mediaType === "video") {
          setRemoteUserExists(false)
          setConnected(false)
          setStatus(role === "doctor" ? "রোগী ক্যামেরা বন্ধ করেছে" : "ডাক্তার ক্যামেরা বন্ধ করেছে")
        }
      })

      client.on("user-left", () => {
        remoteUserRef.current = null
        setRemoteUserExists(false)
        setConnected(false)
        setStatus(role === "doctor" ? "রোগী চলে গেছে" : "ডাক্তার চলে গেছে")
      })

      const uid = Math.floor(Math.random() * 100000) + 1

      setConnectionStep("রুমে জয়েন হচ্ছে...")

      await client.join(
        AGORA_APP_ID, // New App ID: e66b5e13d30b4844b6f95ad4b9cd7572
        roomId, // Channel name
        null, // Token = null (PERMANENT for Testing Mode)
        uid, // Random User ID
      )

      setConnectionStep("ক্যামেরা চালু হচ্ছে...")

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { encoderConfig: "speech_low_quality", AEC: true, ANS: true },
        { encoderConfig: "180p_1", facingMode: "user" },
      )

      localAudioTrackRef.current = audioTrack
      localVideoTrackRef.current = videoTrack

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current)
      }

      setConnectionStep("ভিডিও পাবলিশ হচ্ছে...")

      await client.publish([audioTrack, videoTrack])

      setJoined(true)
      setConnectionStep("")
      setStatus(role === "doctor" ? "রোগীর জন্য অপেক্ষা করছি..." : "ডাক্তারের জন্য অপেক্ষা করছি...")
    } catch (err: any) {
      console.error("Agora error:", err)

      let errorMsg = "সংযোগে সমস্যা হয়েছে।"

      if (err.code === "CAN_NOT_GET_GATEWAY_SERVER") {
        errorMsg = "Agora সার্ভার পাওয়া যাচ্ছে না। App ID চেক করুন।"
      } else if (err.message?.includes("token") || err.code === "INVALID_TOKEN") {
        errorMsg = "Token সমস্যা। Testing Mode enable আছে কিনা চেক করুন।"
      } else if (err.message?.includes("network") || err.message?.includes("timeout")) {
        errorMsg = "নেটওয়ার্ক সমস্যা। ইন্টারনেট চেক করুন।"
      } else if (err.code === "INVALID_PARAMS") {
        errorMsg = "App ID ভুল। Agora Console থেকে সঠিক App ID নিন।"
      }

      setError(errorMsg)
      setStatus("সংযোগ ব্যর্থ")
      setConnectionStep("")
    } finally {
      setIsConnecting(false)
    }
  }, [permissionGranted, isConnecting, joined, roomId, role])

  // Auto-connect when permission granted
  useEffect(() => {
    if (permissionGranted && !joined && !isConnecting) {
      const timer = setTimeout(() => initAndJoinAgora(), 300)
      return () => clearTimeout(timer)
    }
  }, [permissionGranted, joined, isConnecting, initAndJoinAgora])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localVideoTrackRef.current?.close()
      localAudioTrackRef.current?.close()
      clientRef.current?.leave()
    }
  }, [])

  const handleRetry = async () => {
    try {
      localVideoTrackRef.current?.close()
      localAudioTrackRef.current?.close()
      await clientRef.current?.leave()
    } catch {}

    // Reset all refs
    clientRef.current = null
    localVideoTrackRef.current = null
    localAudioTrackRef.current = null
    remoteUserRef.current = null

    // Reset all states
    setJoined(false)
    setConnected(false)
    setRemoteUserExists(false)
    setError(null)
    setIsConnecting(false)
    setConnectionStep("")
    setStatus("পুনরায় সংযোগ করা হচ্ছে...")

    // Wait a moment then retry
    setTimeout(() => initAndJoinAgora(), 500)
  }

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!videoOn)
      setVideoOn(!videoOn)
    }
  }

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!audioOn)
      setAudioOn(!audioOn)
    }
  }

  const toggleSpeaker = () => {
    if (remoteUserRef.current?.audioTrack) {
      remoteUserRef.current.audioTrack.setVolume(speakerOn ? 0 : 100)
    }
    setSpeakerOn(!speakerOn)
  }

  const endCall = async () => {
    localVideoTrackRef.current?.close()
    localAudioTrackRef.current?.close()
    await clientRef.current?.leave()
    
    // Process revenue sharing when call ends (if doctor ended the call)
    if (role === "doctor") {
      try {
        const appointmentId = searchParams.get("appointmentId")
        if (appointmentId) {
          // Get appointment details and process payment
          const appointmentData = localStorage.getItem(`shusto_appointment_${appointmentId}`)
          if (appointmentData) {
            const appointment = JSON.parse(appointmentData)
            const consultationFee = appointment.consultation_fee || 500
            
            // Calculate revenue split: 70% doctor, 30% admin
            const doctorShare = Math.round(consultationFee * 0.70)
            const adminShare = Math.round(consultationFee * 0.30)
            
            // Save doctor earnings
            const doctorEarnings = JSON.parse(localStorage.getItem("shusto_doctor_earnings") || "[]")
            doctorEarnings.push({
              id: `earn_${Date.now()}`,
              appointment_id: appointmentId,
              doctor_id: appointment.doctor_id,
              doctor_email: appointment.doctor_email,
              total_fee: consultationFee,
              doctor_share: doctorShare,
              admin_share: adminShare,
              created_at: new Date().toISOString(),
              status: "completed"
            })
            localStorage.setItem("shusto_doctor_earnings", JSON.stringify(doctorEarnings))
            
            // Save admin earnings
            const adminEarnings = JSON.parse(localStorage.getItem("shusto_admin_earnings") || "[]")
            adminEarnings.push({
              id: `admin_earn_${Date.now()}`,
              appointment_id: appointmentId,
              source: "doctor_consultation",
              doctor_name: appointment.doctor_name,
              total_fee: consultationFee,
              commission_amount: adminShare,
              commission_rate: 30,
              created_at: new Date().toISOString()
            })
            localStorage.setItem("shusto_admin_earnings", JSON.stringify(adminEarnings))
            
            // Update appointment status
            appointment.status = "completed"
            appointment.completed_at = new Date().toISOString()
            localStorage.setItem(`shusto_appointment_${appointmentId}`, JSON.stringify(appointment))
            
            console.log(`[v0] Revenue processed: Doctor got ৳${doctorShare}, Admin got ৳${adminShare}`)
          }
        }
      } catch (err) {
        console.error("[v0] Error processing revenue:", err)
      }
    }
    
    router.push("/")
  }

  // Permission screen - Full screen mandatory
  if (!permissionGranted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 z-50">
        <div className="max-w-sm w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-pulse">
            <Video className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-xl font-bold text-white mb-3">ভিডিও কলের জন্য অনুমতি দিন</h1>
          <p className="text-slate-300 mb-6 text-sm">
            ক্যামেরা এবং মাইক্রোফোন চালু করতে <strong className="text-white">"Allow"</strong> বাটনে ক্লিক করুন।
          </p>

          {(error || permissionDenied) && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 mb-4">
              <p className="text-red-300 text-sm">{error || "অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।"}</p>
            </div>
          )}

          <button
            onClick={requestPermission}
            disabled={checkingPermission}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {checkingPermission ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>চেক হচ্ছে...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>ক্যামেরা ও মাইক চালু করুন</span>
              </>
            )}
          </button>

          <button onClick={() => router.push("/")} className="mt-4 text-slate-400 hover:text-white text-sm">
            হোমে ফিরে যান
          </button>
        </div>

        <div className="mt-6 text-slate-500 text-xs text-center">
          <p>
            Room: {roomId} | Role: {role === "doctor" ? "ডাক্তার" : "রোগী"}
          </p>
        </div>
      </div>
    )
  }

  // Main video call UI
  return (
    <div className="fixed inset-0 bg-slate-900">
      {/* Remote Video (full screen) */}
      <div
        ref={remoteVideoRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${remoteUserExists ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "#1e293b" }}
      />

      {/* Waiting/Connecting UI */}
      {!remoteUserExists && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="w-28 h-28 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 border-4 border-slate-600">
            <svg className="w-14 h-14 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          {error ? (
            <div className="text-center px-6 max-w-md">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                <span>আবার চেষ্টা করুন</span>
              </button>
            </div>
          ) : (
            <>
              {connectionStep ? (
                <p className="text-emerald-400 text-lg mb-2">{connectionStep}</p>
              ) : (
                <div className="flex gap-2 mb-3">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
                  <span
                    className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              )}
              <p className="text-white text-lg font-medium">{status}</p>
              <p className="text-slate-500 text-xs mt-2">Room: {roomId}</p>
            </>
          )}
        </div>
      )}

      {/* Local Video Preview (corner) */}
      <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-20 bg-slate-800">
        <div ref={localVideoRef} className="w-full h-full" style={{ transform: "scaleX(-1)" }} />
        {!videoOn && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <Camera className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl z-20">
        <p className="text-white font-bold text-sm">{role === "doctor" ? "রোগী" : "ডাক্তার"}</p>
        <p className={`text-xs ${connected ? "text-emerald-400" : "text-yellow-400"}`}>
          {connected ? "সংযুক্ত" : joined ? "অপেক্ষমান" : "সংযোগ হচ্ছে..."}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${videoOn ? "bg-slate-700/90 text-white" : "bg-white text-slate-900"}`}
        >
          <Camera className={`w-6 h-6 ${!videoOn && "opacity-50"}`} />
        </button>

        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${audioOn ? "bg-slate-700/90 text-white" : "bg-white text-slate-900"}`}
        >
          <Mic className={`w-6 h-6 ${!audioOn && "opacity-50"}`} />
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/40 transition-all"
        >
          <Phone className="w-7 h-7 rotate-[135deg]" />
        </button>

        <button
          onClick={toggleSpeaker}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${speakerOn ? "bg-slate-700/90 text-white" : "bg-white text-slate-900"}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {speakerOn && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function VideoCall() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <VideoCallContent />
    </Suspense>
  )
}
