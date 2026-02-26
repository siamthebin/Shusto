"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Video, Mic, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VideoCallRoom({ roomUrl }: { roomUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Daily.co will be embedded here
    console.log("[v0] Video call room initialized with URL:", roomUrl)
  }, [roomUrl])

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Daily.co iframe will be embedded here */}
      <iframe
        ref={iframeRef}
        src={roomUrl}
        allow="camera; microphone; fullscreen; display-capture"
        className="w-full h-full"
      />

      {/* Fallback UI for demo */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-700">
        <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 text-center">
          <Video className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Video Call Room</h3>
          <p className="text-emerald-100 mb-6">Daily.co integration - Camera ও microphone access দিন</p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Mic className="w-5 h-5" />
            </Button>
            <Button size="lg" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Video className="w-5 h-5" />
            </Button>
            <Button size="lg" className="bg-red-500 hover:bg-red-600">
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-emerald-200 mt-6">
            Note: DAILY_API_KEY environment variable যোগ করলে full video call কাজ করবে
          </p>
        </Card>
      </div>
    </div>
  )
}
