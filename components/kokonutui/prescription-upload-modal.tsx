"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, CheckCircle } from "lucide-react"

interface PrescriptionUploadModalProps {
  onClose: () => void
  onUploadComplete: () => void
}

export function PrescriptionUploadModal({ onClose, onUploadComplete }: PrescriptionUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsUploading(false)
    setUploadSuccess(true)

    // Close modal after showing success
    setTimeout(() => {
      onUploadComplete()
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">প্রেসক্রিপশন আপলোড করুন</h2>

        {!uploadSuccess ? (
          <>
            <p className="mb-6 text-gray-600">আপনার ডাক্তারের প্রেসক্রিপশন আপলোড করুন। আমরা দ্রুত আপনার অর্ডার প্রস্তুত করব।</p>

            <div className="mb-6">
              <label
                htmlFor="prescription-file"
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
              >
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[200px] rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Upload className="mb-3 h-12 w-12 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-700">ছবি আপলোড করতে ক্লিক করুন</p>
                    <p className="text-xs text-gray-500">PNG, JPG বা PDF (সর্বোচ্চ 10MB)</p>
                  </div>
                )}
                <input
                  id="prescription-file"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? "আপলোড হচ্ছে..." : "আপলোড করুন"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="mb-4 h-16 w-16 text-emerald-600" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">সফলভাবে আপলোড হয়েছে!</h3>
            <p className="text-center text-gray-600">আমরা শীঘ্রই আপনার প্রেসক্রিপশন যাচাই করে আপনার সাথে যোগাযোগ করব।</p>
          </div>
        )}
      </div>
    </div>
  )
}
