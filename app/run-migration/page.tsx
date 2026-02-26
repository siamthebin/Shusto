"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function RunMigrationPage() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const runMigration = async () => {
    setLoading(true)
    setStatus("Running migration...")

    try {
      const response = await fetch("/api/run-migration", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setStatus("✅ Migration successful! doctor_email column added.")
      } else {
        setStatus(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Migration</h1>
      <p className="mb-4">Click to add doctor_email column to appointments table</p>

      <Button onClick={runMigration} disabled={loading}>
        {loading ? "Running..." : "Run Migration"}
      </Button>

      {status && <div className="mt-4 p-4 bg-gray-100 rounded">{status}</div>}
    </div>
  )
}
