"use client"

import { Phone, User } from "lucide-react"
import { useEffect, useState } from "react"

interface IncomingCallModalProps {
  doctorName: string
  specialty: string
  onAccept: () => void
  onReject: () => void
}

export default function IncomingCallModal({ doctorName, specialty, onAccept }: IncomingCallModalProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-top duration-500">
        <div className="py-12 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <div className="relative w-28 h-28 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/40">
              <User className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Doctor info */}
          <h2 className="text-3xl font-bold text-white mb-2 text-center px-6">{doctorName}</h2>
          <p className="text-emerald-100 text-lg mb-1">{specialty}</p>
          <p className="text-white/90 text-xl font-medium">ভিডিও কল করছেন...</p>

          {/* Call duration */}
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-full px-8 py-3">
            <p className="text-white font-mono text-2xl font-bold">{formatTime(seconds)}</p>
          </div>
        </div>

        <div className="bg-emerald-800/50 backdrop-blur-sm p-8">
          <button
            onClick={onAccept}
            className="w-full bg-white hover:bg-emerald-50 text-emerald-600 font-bold text-xl py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
          >
            <Phone className="w-7 h-7" />
            কল গ্রহণ করুন
          </button>

          <p className="text-center text-emerald-100 text-sm mt-4">কলটি গ্রহণ করতে বোতামে ট্যাপ করুন</p>
        </div>
      </div>
    </div>
  )
}
