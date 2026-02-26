"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddDoctorPage() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [bmdcNumber, setBmdcNumber] = useState("")
  const [experience, setExperience] = useState("")
  const [price, setPrice] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "শুধু ছবি ফাইল upload করুন" })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "ছবির সাইজ ৫MB এর কম হতে হবে" })
      return
    }

    setPhotoFile(file)
    setUploadingPhoto(true)

    try {
      // Upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Photo upload failed")
      }

      const { url } = await uploadResponse.json()
      setPhotoUrl(url)
      setMessage({ type: "success", text: "ছবি সফলভাবে upload হয়েছে!" })
    } catch (error) {
      setMessage({ type: "error", text: "ছবি upload করতে সমস্যা হয়েছে" })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/add-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          specialty,
          bmdcNumber,
          experience: Number.parseInt(experience) || 1,
          price: Number.parseInt(price) || 500,
          photoUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({
          type: "error",
          text: `Error: ${result.error || "Unknown error"}`,
        })
      } else {
        setMessage({
          type: "success",
          text: "ডাক্তার সফলভাবে যুক্ত হয়েছে!",
        })
        setName("")
        setEmail("")
        setSpecialty("")
        setBmdcNumber("")
        setExperience("")
        setPrice("")
        setPhotoUrl("")
        setPhotoFile(null)
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `Network Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">নতুন ডাক্তার যোগ করুন</h1>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-base font-medium mb-2 block text-gray-900">
                নাম
              </Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-medium mb-2 block text-gray-900">
                ইমেইল
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="specialty" className="text-base font-medium mb-2 block text-gray-900">
                বিশেষত্ব
              </Label>
              <Input
                id="specialty"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="bmdcNumber" className="text-base font-medium mb-2 block text-gray-900">
                BMDC নম্বর
              </Label>
              <Input
                id="bmdcNumber"
                required
                value={bmdcNumber}
                onChange={(e) => setBmdcNumber(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-base font-medium mb-2 block text-gray-900">
                পরামর্শ ফি (টাকা)
              </Label>
              <Input
                id="price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-base font-medium mb-2 block text-gray-900">
                অভিজ্ঞতা (বছর)
              </Label>
              <Input
                id="experience"
                type="number"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="photoUrl" className="text-base font-medium mb-2 block text-gray-900">
                ছবি URL (Optional)
              </Label>
              <Input
                id="photoUrl"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/doctor-photo.jpg"
                className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 text-gray-900 bg-white"
              />
              <p className="text-sm text-gray-600 mt-1">ডাক্তারের ছবির লিংক দিন (খালি রাখলে default ছবি দেখাবে)</p>
            </div>

            <div>
              <Label className="text-base font-medium mb-2 block text-gray-900">অথবা ছবি Upload করুন</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 bg-white"
                />
                {photoUrl && (
                  <img
                    src={photoUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2"
                  />
                )}
              </div>
              {uploadingPhoto && <p className="text-sm text-gray-600 mt-1">Upload হচ্ছে...</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 mt-8"
            >
              {loading ? "সেভ করা হচ্ছে..." : "Done"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
