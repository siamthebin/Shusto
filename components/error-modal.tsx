"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  details?: string
}

export function ErrorModal({ isOpen, onClose, message, details }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">{message}</DialogTitle>
          {details && (
            <p className="text-sm text-gray-600 mt-2 font-mono bg-gray-50 p-2 rounded border border-gray-200">
              {details}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3 py-4 text-center">
          <p className="text-gray-600">দয়া করে আবার চেষ্টা করুন অথবা সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
            ঠিক আছে
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
