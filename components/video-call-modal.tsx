"use client"

import { useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function VideoCallModal({
  roomUrl,
  doctorName,
  patientName, // Added optional patientName parameter for doctor dashboard
  onClose,
}: {
  roomUrl: string
  doctorName: string
  patientName?: string // Optional patient name
  onClose: () => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Daily.co automatically handles the video call interface
    // The iframe will load the Daily.co prejoin and call UI
  }, [])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <div className="flex items-center justify-between p-4 border-b bg-emerald-50">
          <div>
            <h3 className="font-semibold text-emerald-900">
              {patientName ? `${doctorName} ও ${patientName} এর consultation` : `${doctorName} - এর সাথে পরামর্শ`}
            </h3>
            <p className="text-sm text-emerald-700">ভিডিও কল চলছে</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-emerald-700 hover:bg-emerald-100">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 h-full">
          <iframe
            ref={iframeRef}
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
