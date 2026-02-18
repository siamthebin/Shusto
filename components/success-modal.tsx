"use client"

import { useEffect, useState } from "react"
import { X, Check, Sparkles, Calendar, Clock } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
}

function SuccessModal({ isOpen, onClose, doctorName }: SuccessModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
      }))
      setConfetti(newConfetti)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Confetti */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute top-0 w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${item.left}%`,
            background: `hsl(${Math.random() * 360}, 80%, 60%)`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        />
      ))}

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden animate-in zoom-in duration-300">
        {/* Animated background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-300/20 to-emerald-300/20 rounded-full blur-2xl animate-pulse delay-150" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Success icon with animation */}
          <div className="mx-auto w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-ping opacity-75" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-12 h-12 text-white animate-bounce" strokeWidth={3} />
            </div>
          </div>

          {/* Sparkles */}
          <div className="flex justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse delay-75" />
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse delay-150" />
          </div>

          {/* Success message */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom-4 duration-500">
            🎉 অসাধারণ! 🎉
          </h2>

          <p className="text-xl font-semibold text-gray-800 mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            আপনার অ্যাপয়েন্টমেন্ট সফল হয়েছে!
          </p>

          <p className="text-base text-gray-600 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-150">
            <span className="font-medium text-emerald-700">{doctorName}</span> শীঘ্রই আপনার অ্যাপয়েন্টমেন্ট দেখবেন এবং নিশ্চিত
            করবেন।
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 animate-in slide-in-from-left duration-500 delay-200">
              <Calendar className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">অপেক্ষা করুন</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-teal-100 animate-in slide-in-from-right duration-500 delay-200">
              <Clock className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">শীঘ্রই নিশ্চিত হবে</p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 delay-300"
          >
            ধন্যবাদ! 🙏
          </button>

          {/* Bottom decoration */}
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { SuccessModal }
export default SuccessModal
