"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { createClient } from "@/lib/supabase/client"

interface TopBarProps {
  cartItemCount: number
  onCartClick: () => void
  onSearch: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  "সব",
  "ব্যথানাশক",
  "গ্যাস্ট্রিক",
  "হৃদরোগ",
  "এলার্জি",
  "ভিটামিন",
  "চিকিৎসা যন্ত্র",
  "পিপিই",
  "স্বাস্থ্যবিধি",
  "ডায়াবেটিস কেয়ার",
]

export function TopBar({ cartItemCount, onCartClick, onSearch, selectedCategory, onCategoryChange }: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [dashboardPath, setDashboardPath] = useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Detect user role if logged in
      if (user?.email) {
        await detectRole(user.email)
      }
    }
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        // Await the role detection
        detectRole(session.user.email).catch((err) => {
          console.error("[v0] Error detecting role on auth change:", err)
        })
      } else {
        setUserRole(null)
        setDashboardPath(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const detectRole = async (email: string) => {
    try {
      const emailLower = email.toLowerCase()
      console.log("[v0] Detecting role for email:", emailLower)
      
      // Check labs table
      const { data: lab, error: labError } = await supabase
        .from("labs")
        .select("id, name")
        .eq("email", emailLower)
        .single()

      if (lab) {
        console.log("[v0] Found LAB in database:", lab)
        setUserRole("lab")
        setDashboardPath("/lab/dashboard")
        return
      }

      // Check doctors table
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id, full_name")
        .eq("email", email.toLowerCase())
        .single()

      if (doctor) {
        console.log("[v0] Found DOCTOR in database:", doctor)
        setUserRole("doctor")
        setDashboardPath("/doctor/dashboard")
        return
      }

      // Check hospitals table
      const { data: hospital } = await supabase
        .from("hospitals")
        .select("id, name")
        .eq("email", email.toLowerCase())
        .single()

      if (hospital) {
        console.log("[v0] Found HOSPITAL in database:", hospital)
        setUserRole("hospital")
        setDashboardPath("/hospital/dashboard")
        return
      }

      // Check pharmacies table
      const { data: pharmacy } = await supabase
        .from("pharmacies")
        .select("id, name")
        .eq("email", email.toLowerCase())
        .single()

      if (pharmacy) {
        console.log("[v0] Found PHARMACY in database:", pharmacy)
        setUserRole("pharmacy")
        setDashboardPath("/pharmacy/dashboard")
        return
      }

      // Check physio table
      const { data: physio, error: physioError } = await supabase
        .from("physio")
        .select("id, name")
        .eq("email", emailLower)
        .single()

      if (physio) {
        console.log("[v0] Found PHYSIO in database:", physio)
        setUserRole("physio")
        setDashboardPath("/physio/dashboard")
        console.log("[v0] Dashboard path set to: /physio/dashboard")
        return
      }
      
      if (physioError && physioError.code !== 'PGRST116') {
        console.log("[v0] Physio query error:", physioError)
      }

      // Check ambulance table
      const { data: ambulance } = await supabase
        .from("ambulance")
        .select("id, driver_name")
        .eq("email", email.toLowerCase())
        .single()

      if (ambulance) {
        console.log("[v0] Found AMBULANCE in database:", ambulance)
        setUserRole("ambulance")
        setDashboardPath("/ambulance/dashboard")
        return
      }

      console.log("[v0] No provider role found - user is a patient")
      setUserRole("patient")
      setDashboardPath(null)
    } catch (error) {
      console.log("[v0] Error detecting role:", error)
      setUserRole("patient")
      setDashboardPath(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowProfileMenu(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false)
      searchInputRef.current?.blur()
    }
  }

  return (
    <>
      <div
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled ? "bg-white shadow-sm dark:bg-zinc-900" : "bg-white dark:bg-zinc-900"
        } border-b border-zinc-200 dark:border-zinc-800`}
      >
        <div className="flex items-center justify-between px-3 h-12">
          <Link href="/" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
            সুস্থ.কম
          </Link>
          <div className="flex-1 px-8 overflow-x-auto flex items-center justify-center gap-6 scrollbar-none">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "text-zinc-900 dark:text-white text-sm font-medium"
                    : "text-zinc-600 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white"
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`relative transition-all duration-200 ${isSearchOpen ? "w-auto" : "w-0"}`}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ওষুধ খুঁজুন..."
                className={`w-48 sm:w-56 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm px-3 py-1.5 
                                  text-zinc-800 dark:text-zinc-200
                                  focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700
                                  transition-all duration-200 ${isSearchOpen ? "opacity-100" : "opacity-0"}`}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              {isSearchOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false)
                    onSearch("")
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-200 
                                      dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-md transition-colors text-zinc-700 dark:text-zinc-300 ${
                isSearchOpen ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                >
                  লগইন
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsSignInOpen(true)
                  }}
                  className="relative z-50 px-3 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                  style={{ pointerEvents: "auto" }}
                >
                  সাইন ইন
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 py-2 z-50">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.email}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{userRole}</p>
                    </div>
                    
                    {/* Show Dashboard button for providers */}
                    {dashboardPath && (
                      <>
                        <Link
                          href={dashboardPath}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 13l4-8m4 8V9"
                            />
                          </svg>
                          ড্যাশবোর্ড
                        </Link>
                        <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                      </>
                    )}
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      প্রোফাইল
                    </Link>
                    <Link
                      href="/my-orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      আমার অর্ডার
                    </Link>
                    <Link
                      href="/wallet"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      ওয়ালেট
                    </Link>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onCartClick}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md relative text-zinc-700 dark:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-zinc-900 dark:bg-white 
                                      text-white dark:text-zinc-900 text-xs font-medium w-4 h-4 
                                      flex items-center justify-center rounded-full animate-in zoom-in duration-200"
                >
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  )
}
