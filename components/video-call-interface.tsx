"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from "lucide-react"

interface VideoCallInterfaceProps {
  appointmentId: string
  patientName: string
  onEndCall: () => void
}

export function VideoCallInterface({ appointmentId, patientName, onEndCall }: VideoCallInterfaceProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initializeCall()
    return () => {
      cleanup()
    }
  }, [])

  const initializeCall = async () => {
    try {
      // Get local media stream (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize WebRTC peer connection
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      // Handle incoming remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
          setCallStatus("connected")
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: "ice-candidate",
            candidate: event.candidate,
            appointmentId,
          })
        }
      }

      // Create and send offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      sendSignal({
        type: "offer",
        offer,
        appointmentId,
      })
    } catch (error) {
      console.error("Error initializing call:", error)
      alert("ক্যামেরা বা মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে। অনুগ্রহ করে অনুমতি দিন।")
    }
  }

  const sendSignal = async (signal: any) => {
    try {
      await fetch("/api/video-call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signal),
      })
    } catch (error) {
      console.error("Signaling error:", error)
    }
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

  const endCall = () => {
    cleanup()
    setCallStatus("ended")
    onEndCall()
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Remote video (main view) */}
      <div className="relative flex-1 bg-gray-800">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse shadow-2xl">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-2xl font-bold mb-2">{patientName}</p>
              <p className="text-white/70 text-lg">কল করছি...</p>
            </div>
          </div>
        )}

        {/* Local video (small overlay) */}
        <div className="absolute top-4 right-4 w-40 h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-800">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Patient info overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
          <p className="text-white font-bold text-lg">{patientName}</p>
          <p className="text-white/80 text-sm flex items-center gap-2">
            {callStatus === "connecting" && (
              <>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                সংযোগ হচ্ছে...
              </>
            )}
            {callStatus === "connected" && (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                কথা চলছে
              </>
            )}
          </p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="bg-gray-900 p-8 flex items-center justify-center gap-6">
        <Button
          size="lg"
          variant={isVideoEnabled ? "default" : "destructive"}
          className="w-16 h-16 rounded-full shadow-lg"
          onClick={toggleVideo}
        >
          {isVideoEnabled ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
        </Button>

        <Button
          size="lg"
          variant={isAudioEnabled ? "default" : "destructive"}
          className="w-16 h-16 rounded-full shadow-lg"
          onClick={toggleAudio}
        >
          {isAudioEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
        </Button>

        <Button
          size="lg"
          variant="destructive"
          className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl"
          onClick={endCall}
        >
          <PhoneOff className="w-9 h-9" />
        </Button>
      </div>
    </div>
  )
}
