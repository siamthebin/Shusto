"use client"

import { useState, useEffect, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

interface Medicine {
  id: string
  name: string
  generic_name: string
  company: string
  strength: string
  dosage_form: string
  price: number
  description: string
  category: string
  prescription_required: boolean
  image_url?: string
}

interface MedicineSearchBarProps {
  onProductSelect: (medicine: any) => void
}

export default function MedicineSearchBar({ onProductSelect }: MedicineSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function searchMedicines() {
      const trimmedQuery = searchQuery.trim()

      if (!trimmedQuery) {
        setFilteredProducts([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      console.log("[v0] Searching for:", trimmedQuery)

      try {
        const { data, error } = await supabase
          .from("medicines")
          .select("*")
          .ilike("name", `%${trimmedQuery}%`)
          .ilike("generic_name", `%${trimmedQuery}%`)
          .ilike("company", `%${trimmedQuery}%`)
          .limit(10)

        if (error) {
          console.error("[v0] Supabase search error:", error)
          // Fallback: try searching just by name if OR query fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("medicines")
            .select("*")
            .ilike("name", `%${trimmedQuery}%`)
            .limit(10)

          if (fallbackError) {
            console.error("[v0] Fallback search error:", fallbackError)
            setFilteredProducts([])
          } else {
            console.log("[v0] Found medicines (fallback):", fallbackData?.length || 0)
            setFilteredProducts(fallbackData || [])
            setIsOpen(true)
          }
        } else {
          console.log("[v0] Found medicines:", data?.length || 0)
          setFilteredProducts(data || [])
          setIsOpen(true)
        }
      } catch (error) {
        console.error("[v0] Search error:", error)
        // Final fallback: search by name only
        try {
          const { data: fallbackData } = await supabase
            .from("medicines")
            .select("*")
            .ilike("name", `%${trimmedQuery}%`)
            .limit(10)

          setFilteredProducts(fallbackData || [])
          if (fallbackData && fallbackData.length > 0) {
            setIsOpen(true)
          }
        } catch (fallbackError) {
          console.error("[v0] Final fallback error:", fallbackError)
          setFilteredProducts([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchMedicines, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, supabase])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProductClick = (medicine: Medicine) => {
    console.log("[v0] Medicine selected:", medicine.name)
    onProductSelect({
      id: medicine.id,
      name: medicine.name,
      description: medicine.description,
      price: medicine.price,
      category: medicine.category,
      prescription: medicine.prescription_required,
      image: medicine.image_url || "/placeholder.svg?height=400&width=400",
    })
    setSearchQuery("")
    setIsOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsOpen(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto px-4 py-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ব্র্যান্ড বা জেনেরিক নাম দিয়ে খুঁজুন"
          className="w-full pl-12 pr-12 py-3 border-2 border-zinc-200 rounded-lg focus:border-emerald-500 focus:outline-none text-base text-zinc-900 placeholder:text-zinc-400 bg-white"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-6 text-center text-zinc-500">খুঁজছি...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((medicine) => (
              <button
                key={medicine.id}
                onClick={() => handleProductClick(medicine)}
                className="w-full flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0 text-left"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900">{medicine.name}</h3>
                  <p className="text-sm text-zinc-600">
                    {medicine.generic_name} - {medicine.strength}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{medicine.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-600 font-bold">৳{medicine.price.toFixed(2)}</span>
                    <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">{medicine.category}</span>
                    {medicine.prescription_required && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">প্রেসক্রিপশন প্রয়োজন</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-zinc-600">কোনো ওষুধ পাওয়া যায়নি</p>
              <p className="text-sm text-zinc-400 mt-1">অন্য নাম দিয়ে চেষ্টা করুন</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
