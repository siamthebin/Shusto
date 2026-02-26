"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/kokonutui/bottom-nav"
import { CartDrawer } from "@/components/kokonutui/cart-drawer"
import type { CartItem } from "@/components/kokonutui/data"
import { Search, ShoppingCart, User, Menu, Pill, FlaskConical, Syringe, Heart, Baby, Stethoscope } from "lucide-react"
import Link from "next/link"

interface Medicine {
  id: number
  "brand name": string
  generic: string
  strength: string
  "dosage form": string
  manufacturer: string
  price?: number | string
  price_tag?: number | string
  "package size"?: string
  "package unit"?: string
  "dar no"?: string
  created_at?: string
}

const getDosageFormImage = (dosageForm: string): string => {
  const form = dosageForm?.toLowerCase() || ""
  if (form.includes("tablet") || form.includes("tab")) {
    return "/medicine-tablet-strip-blister-pack.jpg"
  } else if (form.includes("capsule") || form.includes("cap")) {
    return "/medicine-capsule-pills.jpg"
  } else if (form.includes("syrup") || form.includes("suspension") || form.includes("liquid")) {
    return "/medicine-syrup-bottle.jpg"
  } else if (form.includes("injection") || form.includes("inj")) {
    return "/medicine-injection-vial.jpg"
  } else if (form.includes("cream") || form.includes("ointment") || form.includes("gel")) {
    return "/medicine-cream-tube.png"
  } else if (form.includes("drop") || form.includes("eye") || form.includes("ear")) {
    return "/medicine-eye-drops-bottle.jpg"
  } else if (form.includes("inhaler")) {
    return "/medicine-inhaler.png"
  } else if (form.includes("powder") || form.includes("sachet")) {
    return "/medicine-powder-sachet.jpg"
  } else if (form.includes("suppository")) {
    return "/medicine-suppository.jpg"
  } else {
    return "/medicine-pharmaceutical-product.jpg"
  }
}

const categories = [
  { id: "all", name: "সব ওষুধ", icon: Pill },
  { id: "tablet", name: "ট্যাবলেট", icon: Pill },
  { id: "capsule", name: "ক্যাপসুল", icon: FlaskConical },
  { id: "syrup", name: "সিরাপ", icon: FlaskConical },
  { id: "injection", name: "ইনজেকশন", icon: Syringe },
  { id: "cream", name: "ক্রিম/মলম", icon: Heart },
  { id: "drops", name: "ড্রপস", icon: Baby },
  { id: "inhaler", name: "ইনহেলার", icon: Stethoscope },
]

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState<any>(null)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shusto_medicine_cart")
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error("Error loading cart:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && cart.length > 0) {
      localStorage.setItem("shusto_medicine_cart", JSON.stringify(cart))
    }
  }, [cart])

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Try to get balance from Supabase
        const { data: walletData } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

        if (walletData) {
          setBalance(walletData.balance || 0)
        } else {
          // Fallback to localStorage
          const savedBalance = localStorage.getItem("shusto_wallet_balance")
          if (savedBalance) {
            setBalance(Number.parseFloat(savedBalance))
          }
        }
      }
    }
    fetchUser()
  }, [])

  const fetchMedicines = useCallback(
    async (pageNum: number, search: string, category: string) => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        let query = supabase.from("medicine").select("*", { count: "exact" })

        if (search.trim()) {
          query = query.or(`"brand name".ilike.%${search}%,generic.ilike.%${search}%`)
        }

        if (category !== "all") {
          query = query.ilike('"dosage form"', `%${category}%`)
        }

        query = query
          .order("id", { ascending: true })
          .order('"brand name"', { ascending: true })
          .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)

        const { data, error, count } = await query

        if (error) {
          console.error("Error fetching medicines:", error)
          setIsLoading(false)
          return
        }

        if (data) {
          if (pageNum === 0) {
            setMedicines(data)
            setFilteredMedicines(data)
          } else {
            setMedicines((prev) => [...prev, ...data])
            setFilteredMedicines((prev) => [...prev, ...data])
          }
          setTotalCount(count || 0)
          setHasMore(data.length === ITEMS_PER_PAGE)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Fetch exception:", error)
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchMedicines(0, searchQuery, selectedCategory)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0)
      fetchMedicines(0, searchQuery, selectedCategory)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchMedicines(nextPage, searchQuery, selectedCategory)
  }

  function addToCart(medicine: Medicine) {
    const brandName = medicine["brand name"] || ""
    const genericName = medicine.generic || ""
    const dosageForm = medicine["dosage form"] || ""

    const cartItem: CartItem = {
      id: medicine.id.toString(),
      name: brandName,
      description: `${genericName} - ${medicine.strength}`,
      price: typeof medicine.price === "string" ? Number.parseFloat(medicine.price) || 0 : medicine.price || 0,
      image: getDosageFormImage(dosageForm),
      category: dosageForm,
      quantity: 1,
      prescription: false,
      inStock: true,
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.id === cartItem.id)
      let newCart
      if (exists) {
        newCart = prev.map((item) => (item.id === cartItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        newCart = [...prev, cartItem]
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_medicine_cart", JSON.stringify(newCart))
      }
      return newCart
    })
    setIsCartOpen(true)
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId)
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_medicine_cart", JSON.stringify(newCart))
      }
      return newCart
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      const newCart = prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_medicine_cart", JSON.stringify(newCart))
      }
      return newCart
    })
  }

  const formatPrice = (price: any): string => {
    if (price === null || price === undefined) return "0.00"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    if (isNaN(numPrice)) return "0.00"
    return numPrice.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="bg-zinc-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top bar with logo and user */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button className="text-white p-1">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="text-xl font-bold text-white">
                Shusto
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                ৳{balance.toLocaleString()}
              </div>
              <Link href="/profile" className="relative">
                <div className="w-9 h-9 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-white" />
                </div>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand or generic..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        <h1 className="text-2xl font-bold text-white mb-4">Drug Store</h1>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>

        <p className="text-zinc-400 text-sm mb-4">{totalCount.toLocaleString()} টি ওষুধ পাওয়া গেছে</p>

        {isLoading && page === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">লোড হচ্ছে...</p>
            </div>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">কোনো ওষুধ পাওয়া যায়নি</h3>
            <p className="text-zinc-400">অন্য নাম দিয়ে চেষ্টা করুন</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(() => {
                // Remove duplicates based on brand name and strength
                const seen = new Set()
                const uniqueMedicines = filteredMedicines.filter((medicine) => {
                  const key = `${medicine["brand name"]}-${medicine.strength}`
                  if (seen.has(key)) return false
                  seen.add(key)
                  return true
                })
                return uniqueMedicines.map((medicine) => {
                const brandName = medicine["brand name"] || "Unknown"
                const genericName = medicine.generic || ""
                const dosageForm = medicine["dosage form"] || ""
                const manufacturer = medicine.manufacturer || ""
                const strength = medicine.strength || ""
                const price = medicine.price_tag || medicine.price || 0

                return (
                  <div
                    key={medicine.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Medicine Image */}
                    <div className="aspect-square bg-zinc-100 p-2">
                      <img
                        src={getDosageFormImage(dosageForm) || "/placeholder.svg"}
                        alt={brandName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Medicine Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-zinc-900 text-base leading-tight mb-1 line-clamp-1">{brandName}</h3>
                      <p className="text-sm text-zinc-600 mb-0.5 line-clamp-1">{genericName}</p>
                      <p className="text-xs text-zinc-500 mb-0.5">{dosageForm}</p>
                      <p className="text-xs text-zinc-400 mb-2 line-clamp-1">{manufacturer}</p>

                      {/* Price and Strength */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-emerald-600">৳{formatPrice(price)}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{strength}</span>
                      </div>

                      {/* Buy Now Button */}
                      <button
                        onClick={() => addToCart(medicine)}
                        className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors active:scale-95"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                )
                })
              })()}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "লোড হচ্ছে..." : "আরও দেখুন"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart Button - Fixed */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {cart.length}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}

      <BottomNav />
    </div>
  )
}
