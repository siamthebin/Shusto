"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

interface VideoCallProps {
  roomId: string
  userName: string
  onEndCall: () => void
}

export function VideoCall({ roomId, userName, onEndCall }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    console.log("[v0] Initializing video call for room:", roomId)
    initializeCall()

    return () => {
      console.log("[v0] Cleaning up video call")
      cleanup()
    }
  }, [roomId])

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })

      console.log("[v0] Got local stream:", stream.id)
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      peerConnection.ontrack = (event) => {
        console.log("[v0] Received remote track:", event.track.kind)
        const [remoteStream] = event.streams
        setRemoteStream(remoteStream)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
        setIsConnecting(false)
        setConnectionStatus("Connected")
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          console.log("[v0] Sending ICE candidate")
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate,
              roomId,
            }),
          )
        }
      }

      peerConnection.onconnectionstatechange = () => {
        console.log("[v0] Connection state:", peerConnection.connectionState)
        setConnectionStatus(peerConnection.connectionState)

        if (peerConnection.connectionState === "connected") {
          setIsConnecting(false)
        }
      }

      connectToSignalingServer(peerConnection)
    } catch (error) {
      console.error("[v0] Error initializing call:", error)
      setConnectionStatus("Error: Unable to access camera/microphone")
    }
  }

  const connectToSignalingServer = (peerConnection: RTCPeerConnection) => {
    const ws = new WebSocket(`wss://echo.websocket.org`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[v0] Connected to signaling server")
      ws.send(JSON.stringify({ type: "join", roomId, userName }))
    }

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      console.log("[v0] Received signaling message:", message.type)

      switch (message.type) {
        case "offer":
          await handleOffer(peerConnection, message.offer)
          break
        case "answer":
          await handleAnswer(peerConnection, message.answer)
          break
        case "ice-candidate":
          await handleIceCandidate(peerConnection, message.candidate)
          break
      }
    }

    ws.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
      setConnectionStatus("Connection error")
    }
  }

  const handleOffer = async (peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "answer", answer, roomId }))
    }
  }

  const handleAnswer = async (peerConnection: RTCPeerConnection, answer: RTCSessionDescriptionInit) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  const handleIceCandidate = async (peerConnection: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(videoTrack.enabled)
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(audioTrack.enabled)
    }
  }

  const cleanup = () => {
    localStream?.getTracks().forEach((track) => track.stop())
    remoteStream?.getTracks().forEach((track) => track.stop())

    peerConnectionRef.current?.close()

    wsRef.current?.close()
  }

  const handleEndCall = () => {
    cleanup()
    onEndCall()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">ভিডিও কনসালটেশন</h2>
          <p className="text-gray-400 text-sm">{connectionStatus}</p>
        </div>
        <Button onClick={handleEndCall} variant="destructive" className="bg-red-600 hover:bg-red-700">
          <PhoneOff className="w-4 h-4 mr-2" />
          কল শেষ করুন
        </Button>
      </div>

      {/* Video Containers */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-white">
              <div className="animate-pulse mb-4">
                <Video className="w-16 h-16 mx-auto text-gray-500" />
              </div>
              <p className="text-lg">অপেক্ষা করুন...</p>
              <p className="text-sm text-gray-400 mt-2">অন্য ব্যবহারকারী যোগ দিচ্ছেন</p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <Card className="absolute bottom-4 right-4 w-64 h-48 overflow-hidden shadow-2xl border-4 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white" />
            </div>
          )}
        </Card>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6 flex items-center justify-center gap-4">
        <Button
          onClick={toggleAudio}
          size="lg"
          variant={isAudioEnabled ? "secondary" : "destructive"}
          className="rounded-full w-14 h-14"
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          onClick={toggleVideo}
          size="lg"
          variant={isVideoEnabled ? "secondary" : "destructive"}
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  )
}
