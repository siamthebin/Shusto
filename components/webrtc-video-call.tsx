"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react'

interface WebRTCVideoCallProps {
  appointmentId: string
  role: "doctor" | "patient"
  onCallEnd?: () => void
}

export function WebRTCVideoCall({ appointmentId, role, onCallEnd }: WebRTCVideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState<string>("initializing")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    initializeCall()
    return () => {
      cleanup()
    }
  }, [])

  const initializeCall = async () => {
    try {
      console.log("[v0] Initializing video call...")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const config: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      const peerConnection = new RTCPeerConnection(config)
      peerConnectionRef.current = peerConnection

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      peerConnection.ontrack = (event) => {
        console.log("[v0] Received remote track")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("[v0] Sending ICE candidate")
          await fetch("/api/video-call/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId,
              type: "ice-candidate",
              data: event.candidate,
              role,
            }),
          })
        }
      }

      if (role === "doctor") {
        await startCall(peerConnection)
      } else {
        setCallStatus("waiting")
        startPolling()
      }
    } catch (error) {
      console.error("[v0] Call initialization error:", error)
      setCallStatus("error")
    }
  }

  const startCall = async (peerConnection: RTCPeerConnection) => {
    try {
      setCallStatus("calling")

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      await fetch("/api/video-call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          type: "offer",
          data: offer,
          role,
        }),
      })

      startPolling()
    } catch (error) {
      console.error("[v0] Start call error:", error)
    }
  }

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-call/signal?appointmentId=${appointmentId}`)
        const data = await response.json()

        const peerConnection = peerConnectionRef.current
        if (!peerConnection) return

        if (role === "patient" && data.call_offer && !peerConnection.remoteDescription) {
          console.log("[v0] Received offer, creating answer...")
          const offer = JSON.parse(data.call_offer)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)

          await fetch("/api/video-call/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId,
              type: "answer",
              data: answer,
              role,
            }),
          })

          setCallStatus("active")
        }

        if (role === "doctor" && data.call_answer && !peerConnection.remoteDescription) {
          console.log("[v0] Received answer")
          const answer = JSON.parse(data.call_answer)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          setCallStatus("active")
        }

        const candidates = role === "doctor" ? data.ice_candidates_patient : data.ice_candidates_doctor

        if (candidates && Array.isArray(candidates)) {
          for (const candidateStr of candidates) {
            try {
              const candidate = JSON.parse(candidateStr)
              if (candidate && !peerConnection.remoteDescription) continue
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (e) {
            }
          }
        }

        if (data.call_status === "ended") {
          setCallStatus("ended")
          cleanup()
        }
      } catch (error) {
        console.error("[v0] Polling error:", error)
      }
    }, 2000)
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerEnabled
      setIsSpeakerEnabled(!isSpeakerEnabled)
    }
  }

  const endCall = async () => {
    await fetch("/api/video-call/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        type: "end-call",
        role,
      }),
    })

    cleanup()
    onCallEnd?.()
  }

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />

        <div className="absolute bottom-4 right-4 h-40 w-56 overflow-hidden rounded-lg border-2 border-white shadow-lg">
          <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        </div>

        <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-4 py-2 text-white">
          {callStatus === "initializing" && "শুরু হচ্ছে..."}
          {callStatus === "calling" && "কল করা হচ্ছে..."}
          {callStatus === "waiting" && "অপেক্ষা করুন..."}
          {callStatus === "active" && "কল চলছে"}
          {callStatus === "ended" && "কল শেষ"}
          {callStatus === "error" && "সমস্যা হয়েছে"}
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            className="h-14 w-14 rounded-full"
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button
            onClick={toggleAudio}
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            className="h-14 w-14 rounded-full"
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </Button>

          <Button
            onClick={toggleSpeaker}
            size="lg"
            variant={isSpeakerEnabled ? "default" : "destructive"}
            className="h-14 w-14 rounded-full"
          >
            {isSpeakerEnabled ? <Volume2 /> : <VolumeX />}
          </Button>

          <Button onClick={endCall} size="lg" variant="destructive" className="h-14 w-14 rounded-full">
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  )
}
