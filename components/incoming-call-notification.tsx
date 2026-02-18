"use client"

import { useState } from "react"
import { Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface IncomingCallNotificationProps {
  roomId: string
  callerName: string
  callerType: "doctor" | "patient"
  onAccept?: () => void
}

export default function IncomingCallNotification({
  roomId,
  callerName,
  callerType,
  onAccept,
}: IncomingCallNotificationProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)

  const handleAccept = () => {
    setIsVisible(false)
    if (onAccept) {
      onAccept()
    } else {
      router.push(`/video-call?room=${roomId}`)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-in slide-in-from-top duration-500">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
            <Video className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{callerName}</h2>
          <p className="text-emerald-100 text-lg">ভিডিও কল করছেন...</p>
          <p className="text-sm text-emerald-200">{callerType === "doctor" ? "ডাক্তার" : "রোগী"}</p>
        </div>

        {/* Pulsing animation effect */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="relative w-4 h-4 rounded-full bg-white" />
          </div>
        </div>

        {/* Accept Button Only */}
        <Button
          onClick={handleAccept}
          size="lg"
          className="w-full bg-white hover:bg-emerald-50 text-emerald-600 font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Phone className="w-6 h-6 mr-2" />
          কল গ্রহণ করুন
        </Button>
      </div>
    </div>
  )
}
