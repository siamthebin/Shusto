"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ cartCount, onCartOpen, searchQuery, onSearchChange }: HeaderProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isDoctor, setIsDoctor] = useState(false)
  const [isPharmacy, setIsPharmacy] = useState(false)
  const [isLab, setIsLab] = useState(false)
  const [pharmacyName, setPharmacyName] = useState<string | null>(null)
  const [labName, setLabName] = useState<string | null>(null)
  const [showLoginMenu, setShowLoginMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  const isAdmin = user?.email?.toLowerCase() === "shustobd@gmail.com"

  useEffect(() => {
    const supabase = createClient()
    const checkUserRole = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)

      if (authUser) {
        try {
          // Check if user is a pharmacy from database
          const pharmacyRes = await fetch(`/api/pharmacies?email=${encodeURIComponent(authUser.email || "")}`)
          const pharmacyData = await pharmacyRes.json()
          if (pharmacyData.pharmacy) {
            setIsPharmacy(true)
            setPharmacyName(pharmacyData.pharmacy.name)
          }

          // Check if user is a lab from database
          const labRes = await fetch(`/api/labs?email=${encodeURIComponent(authUser.email || "")}`)
          const labData = await labRes.json()
          if (labData.lab) {
            setIsLab(true)
            setLabName(labData.lab.name)
          }
        } catch (error) {
          console.log("[v0] Error checking pharmacy/lab status:", error)
        }

        // Also check user_profiles for role
        const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", authUser.id).single()

        if (profile?.role) {
          setUserRole(profile.role)
          setIsDoctor(profile.role === "doctor")
          if (profile.role === "pharmacy") setIsPharmacy(true)
          if (profile.role === "lab") setIsLab(true)
        }
      }
    }
    checkUserRole()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setIsDoctor(false)
    setIsPharmacy(false)
    setIsLab(false)
    setPharmacyName(null)
    setLabName(null)
    setShowUserMenu(false)
    router.push("/")
  }

  return (
    <div className="bg-emerald-600 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-emerald-700 rounded-full md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xl">+</span>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Shusto</h1>
                <p className="text-xs text-emerald-100">Online Medical Services</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-emerald-700 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                      <p className="text-sm text-zinc-900 font-medium truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isAdmin && (
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            ADMIN
                          </span>
                        )}
                        {isPharmacy && (
                          <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded">
                            PHARMACY
                          </span>
                        )}
                        {isLab && (
                          <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                            LAB
                          </span>
                        )}
                      </div>
                    </div>

                    {isPharmacy && (
                      <>
                        <div className="px-4 py-2 bg-teal-50">
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">
                            {pharmacyName || "ফার্মেসি"} ড্যাশবোর্ড
                          </p>
                        </div>
                        <Link
                          href="/pharmacy/dashboard"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-teal-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="text-sm font-semibold">Pharmacy Dashboard</span>
                        </Link>
                        <div className="border-t border-zinc-200 my-1" />
                      </>
                    )}

                    {isLab && (
                      <>
                        <div className="px-4 py-2 bg-indigo-50">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                            {labName || "ল্যাব"} ড্যাশবোর্ড
                          </p>
                        </div>
                        <Link
                          href="/lab/dashboard"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-indigo-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                          <span className="text-sm font-semibold">Lab Dashboard</span>
                        </Link>
                        <div className="border-t border-zinc-200 my-1" />
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <div className="px-4 py-2 bg-purple-50">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">এডমিন মেন্যু</p>
                        </div>

                        <Link
                          href="/doctors"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-purple-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="text-sm font-semibold">ডাক্তারদের তালিকা</span>
                        </Link>

                        <Link
                          href="/admin/add-doctor"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-purple-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-semibold">ডাক্তার যোগ করুন</span>
                        </Link>

                        <Link
                          href="/admin/manage-doctors"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-sm font-semibold">ডাক্তার মুছুন</span>
                        </Link>

                        <div className="border-t border-zinc-200 my-1" />
                        <div className="px-4 py-2 bg-teal-50">
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">ফার্মেসি ম্যানেজমেন্ট</p>
                        </div>

                        <Link
                          href="/admin/pharmacies"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-teal-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="text-sm font-semibold">ফার্মেসির তালিকা</span>
                        </Link>

                        <Link
                          href="/admin/add-pharmacy"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-teal-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-bold">ফার্মেসি + যোগ করুন</span>
                        </Link>

                        <div className="border-t border-zinc-200 my-1" />
                        <div className="px-4 py-2 bg-indigo-50">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">ল্যাব ম্যানেজমেন্ট</p>
                        </div>

                        <Link
                          href="/admin/labs"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-indigo-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                          <span className="text-sm font-semibold">ল্যাবের তালিকা</span>
                        </Link>

                        <Link
                          href="/admin/add-lab"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-indigo-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-bold">ল্যাব + যোগ করুন</span>
                        </Link>

                        <div className="border-t border-zinc-200 my-1" />
                      </>
                    )}

                    <Link
                      href="/my-orders"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-zinc-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">আমার অর্ডার</span>
                    </Link>

                    <Link
                      href="/wallet"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-zinc-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="text-sm">ওয়ালেট</span>
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-zinc-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm">প্রোফাইল</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-sm">লগআউট</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="p-2 hover:bg-emerald-700 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50">
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-zinc-700 hover:bg-zinc-50"
                      onClick={() => setShowLoginMenu(false)}
                    >
                      লগইন করুন
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-3 text-emerald-600 hover:bg-emerald-50 font-medium"
                      onClick={() => setShowLoginMenu(false)}
                    >
                      নিবন্ধন করুন
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button type="button" onClick={onCartOpen} className="p-2 hover:bg-emerald-700 rounded-full relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden bg-emerald-700 px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 hover:text-emerald-200" onClick={() => setShowMobileMenu(false)}>
            হোম
          </Link>
          <Link
            href="/medicines"
            className="block py-2 hover:text-emerald-200"
            onClick={() => setShowMobileMenu(false)}
          >
            ওষুধ
          </Link>
          <Link href="/doctors" className="block py-2 hover:text-emerald-200" onClick={() => setShowMobileMenu(false)}>
            ডাক্তার
          </Link>
          <Link
            href="/lab-tests"
            className="block py-2 hover:text-emerald-200"
            onClick={() => setShowMobileMenu(false)}
          >
            ল্যাব টেস্ট
          </Link>
        </div>
      )}
    </div>
  )
}
