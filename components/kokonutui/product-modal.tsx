"use client"

import { useState } from "react"
import type { Product } from "./data"

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product) => void
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 md:inset-[25%] z-50 bg-white dark:bg-zinc-900 rounded-t-xl md:rounded-xl overflow-hidden max-h-[65vh] md:max-h-[600px] animate-in slide-in-from-bottom duration-300 flex flex-col mb-20 md:mb-0">
        <div className="flex-1 overflow-y-auto md:flex">
          <div className="relative md:w-2/5 flex-shrink-0">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-[200px] md:h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 md:w-3/5 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold truncate">{product.name}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.category}</p>
                </div>
                <p className="text-lg font-bold text-emerald-600 whitespace-nowrap">৳{product.price}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{product.description}</p>
                <div className="text-sm space-y-1">
                  <p className="text-zinc-500">SKU: {product.id}</p>
                  <p className="text-emerald-600 font-medium">✓ স্টক: পাওয়া যাচ্ছে</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">পরিমাণ:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-zinc-300"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-base text-zinc-900 dark:text-zinc-100">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-zinc-300"
              >
                +
              </button>
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-auto font-medium">
              মোট: ৳{product.price * quantity}
            </span>
          </div>

          <button
            onClick={() => {
              for (let i = 0; i < quantity; i++) {
                onAddToCart(product)
              }
              onClose()
            }}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-lg font-bold rounded-xl transition-colors shadow-lg"
          >
            কার্টে যোগ করুন
          </button>
        </div>
      </div>
    </>
  )
}
