"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function SetupDatabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setStatus("loading")
    setMessage("Database setup শুরু হচ্ছে...")

    try {
      const response = await fetch("/api/admin/setup-database", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Database সফলভাবে setup হয়েছে! সব tables তৈরি হয়েছে।")
      } else {
        setStatus("error")
        setMessage(data.error || "Database setup করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
          <p className="text-gray-600 mb-8">
            এই page থেকে আপনি database tables create করতে পারবেন
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">যা তৈরি হবে:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Doctors table (phone_number সহ)</li>
                <li>Appointments table (video call fields সহ)</li>
                <li>Sample doctors data</li>
              </ul>
            </div>

            <Button
              onClick={setupDatabase}
              disabled={status === "loading"}
              className="w-full"
              size="lg"
            >
              {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === "loading" ? "Setup করছি..." : "Database Setup করুন"}
            </Button>

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">সফল!</h4>
                  <p className="text-green-800">{message}</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Error!</h4>
                  <p className="text-red-800">{message}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
