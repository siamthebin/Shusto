"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Building2, Truck, FlaskConical, Pill, Heart } from "lucide-react"

interface BalanceHeaderProps {
  cartItemCount?: number
  onCartClick?: () => void
  onProductSelect?: (product: any) => void
}

export default function BalanceHeader({ cartItemCount = 0, onCartClick, onProductSelect }: BalanceHeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isDoctor, setIsDoctor] = useState(false)
  const [isPharmacy, setIsPharmacy] = useState(false)
  const [isLab, setIsLab] = useState(false)
  const [isHospital, setIsHospital] = useState(false)
  const [isAmbulance, setIsAmbulance] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user?.email) {
        // Check doctor status
        try {
          const response = await fetch(`/api/check-doctor?email=${encodeURIComponent(user.email)}`)
          const result = await response.json()
          setIsDoctor(result.isDoctor)
        } catch (error) {
          setIsDoctor(false)
        }

        const pharmacies = JSON.parse(localStorage.getItem("shusto_pharmacies") || "[]")
        const isPharm = pharmacies.some((p: any) => p.email?.toLowerCase() === user.email?.toLowerCase())
        setIsPharmacy(isPharm)

        const labs = JSON.parse(localStorage.getItem("shusto_labs") || "[]")
        const isLabUser = labs.some((l: any) => l.email?.toLowerCase() === user.email?.toLowerCase())
        setIsLab(isLabUser)

        const hospitals = JSON.parse(localStorage.getItem("shusto_hospitals") || "[]")
        const isHosp = hospitals.some((h: any) => h.email?.toLowerCase() === user.email?.toLowerCase())
        setIsHospital(isHosp)

        const ambulances = JSON.parse(localStorage.getItem("shusto_ambulances") || "[]")
        const isAmb = ambulances.some((a: any) => a.email?.toLowerCase() === user.email?.toLowerCase())
        setIsAmbulance(isAmb)
      }
    }
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsDoctor(false)
        setIsPharmacy(false)
        setIsLab(false)
        setIsHospital(false)
        setIsAmbulance(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setShowProfileMenu(false)
    setIsDoctor(false)
    setIsPharmacy(false)
    setIsLab(false)
    setIsHospital(false)
    setIsAmbulance(false)
  }

  const isAdmin = user?.email?.toLowerCase() === "shustobd@gmail.com"

  return (
    <div className="sticky top-0 z-40 bg-emerald-600 shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-1 justify-center md:justify-start">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V7c0-.55.45-1 1-1z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-white">Shusto</span>
            <span className="text-xs text-white/90 -mt-1">Online Medical Services</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors">
            হোম
          </Link>
          <Link href="/doctors" className="text-white/90 hover:text-white font-medium transition-colors">
            ডাক্তারের পরামর্শ
          </Link>
          <Link href="/doctor/register" className="text-white/90 hover:text-white font-medium transition-colors">
            ডাক্তার হিসেবে যোগ দিন
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <Link href="/auth/login">
              <Button className="px-4 py-2 text-sm font-semibold bg-white text-emerald-600 hover:bg-zinc-100">
                লগইন
              </Button>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Profile menu"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-zinc-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                  <div className="px-4 py-3 border-b border-zinc-200">
                    <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
                    {/* Role badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {isAdmin && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                          ADMIN
                        </span>
                      )}
                      {isDoctor && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                          DOCTOR
                        </span>
                      )}
                      {isPharmacy && (
                        <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-semibold">
                          PHARMACY
                        </span>
                      )}
                      {isLab && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                          LAB
                        </span>
                      )}
                      {isHospital && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          HOSPITAL
                        </span>
                      )}
                      {isAmbulance && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                          AMBULANCE
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <>
                      <div className="px-4 py-2 bg-purple-50">
                        <p className="text-xs font-semibold text-purple-700 uppercase">এডমিন মেনু</p>
                      </div>
                      <Link
                        href="/doctors"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ডাক্তারদের তালিকা
                      </Link>
                      <Link
                        href="/admin/add-doctor"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        ডাক্তার + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />

                      {/* Pharmacy */}
                      <div className="px-4 py-2 bg-teal-50">
                        <p className="text-xs font-semibold text-teal-700 uppercase">ফার্মেসি</p>
                      </div>
                      <Link
                        href="/admin/pharmacies"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Pill className="w-5 h-5" />
                        ফার্মেসির তালিকা
                      </Link>
                      <Link
                        href="/admin/add-pharmacy"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 font-bold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        ফার্মেসি + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />

                      {/* Lab */}
                      <div className="px-4 py-2 bg-indigo-50">
                        <p className="text-xs font-semibold text-indigo-700 uppercase">ল্যাব</p>
                      </div>
                      <Link
                        href="/admin/labs"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FlaskConical className="w-5 h-5" />
                        ল্যাবের তালিকা
                      </Link>
                      <Link
                        href="/admin/add-lab"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 font-bold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        ল্যাব + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />

                      {/* Hospital */}
                      <div className="px-4 py-2 bg-blue-50">
                        <p className="text-xs font-semibold text-blue-700 uppercase">হাসপাতাল</p>
                      </div>
                      <Link
                        href="/admin/hospitals"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Building2 className="w-5 h-5" />
                        হাসপাতালের তালিকা
                      </Link>
                      <Link
                        href="/admin/add-hospital"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 font-bold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        হাসপাতাল + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />

                      {/* Ambulance */}
                      <div className="px-4 py-2 bg-red-50">
                        <p className="text-xs font-semibold text-red-700 uppercase">অ্যাম্বুলেন্স</p>
                      </div>
                      <Link
                        href="/admin/ambulances"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Truck className="w-5 h-5" />
                        অ্যাম্বুলেন্সের তালিকা
                      </Link>
                      <Link
                        href="/admin/add-ambulance"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 font-bold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        অ্যাম্বুলেন্স + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />

                      {/* Physio & Nursing */}
                      <div className="px-4 py-2 bg-pink-50">
                        <p className="text-xs font-semibold text-pink-700 uppercase">ফিজিও ও নার্সিং</p>
                      </div>
                      <Link
                        href="/admin/physios"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-pink-700 hover:bg-pink-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Heart className="w-5 h-5" />
                        ফিজিও/নার্সিং তালিকা
                      </Link>
                      <Link
                        href="/admin/add-physio"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-pink-700 hover:bg-pink-50 font-bold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        ফিজিও/নার্সিং + যোগ করুন
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />
                    </>
                  )}

                  {/* Provider Dashboards */}
                  {isDoctor && !isAdmin && (
                    <>
                      <Link
                        href="/doctor-portal/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 font-semibold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        ডাক্তার ড্যাশবোর্ড
                      </Link>
                      <div className="border-t border-zinc-200 my-1" />
                    </>
                  )}

                  {isPharmacy && (
                    <Link
                      href="/pharmacy/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 font-semibold"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Pill className="w-5 h-5" />
                      ফার্মেসি ড্যাশবোর্ড
                    </Link>
                  )}

                  {isLab && (
                    <Link
                      href="/lab/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 font-semibold"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FlaskConical className="w-5 h-5" />
                      ল্যাব ড্যাশবোর্ড
                    </Link>
                  )}

                  {isHospital && (
                    <Link
                      href="/hospital/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 font-semibold"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Building2 className="w-5 h-5" />
                      হাসপাতাল ড্যাশবোর্ড
                    </Link>
                  )}

                  {isAmbulance && (
                    <Link
                      href="/ambulance/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 font-semibold"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Truck className="w-5 h-5" />
                      অ্যাম্বুলেন্স ড্যাশবোর্ড
                    </Link>
                  )}

                  {(isPharmacy || isLab || isHospital || isAmbulance) && (
                    <div className="border-t border-zinc-200 my-1" />
                  )}

                  {/* Common Menu Items */}
                  <Link
                    href="/my-orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    আমার অর্ডার
                  </Link>

                  <Link
                    href="/wallet"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    ওয়ালেট
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    প্রোফাইল
                  </Link>

                  <div className="border-t border-zinc-200 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-zinc-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            onClick={onCartClick}
            className="relative p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Shopping cart"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
