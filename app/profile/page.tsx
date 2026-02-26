"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, User, MapPin, Edit2, Trash2, Plus, Check, Home, Briefcase, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  label: string
  is_default?: boolean
  role?: string
}

const LOCAL_STORAGE_ADDRESSES_KEY = "shusto_addresses"
const LOCAL_STORAGE_PROFILE_KEY = "shusto_profile"

function getLocalAddresses(): Address[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ADDRESSES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalAddresses(addresses: Address[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_STORAGE_ADDRESSES_KEY, JSON.stringify(addresses))
}

function getLocalProfile() {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveLocalProfile(profile: any) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile))
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" })
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", label: "home" })

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        const localProfile = getLocalProfile()
        if (localProfile) {
          setProfile(localProfile)
        } else {
          setProfile({
            name: user.user_metadata?.full_name || "",
            phone: user.user_metadata?.phone || "",
            email: user.email || "",
          })
        }

        const localAddresses = getLocalAddresses()
        setAddresses(localAddresses)
      }
    }
    loadUser()
  }, [])

  async function handleSaveProfile() {
    if (!profile.name) {
      alert("নাম দিন")
      return
    }

    try {
      setLoading(true)
      saveLocalProfile(profile)
      alert("প্রোফাইল সংরক্ষণ হয়েছে")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("প্রোফাইল সংরক্ষণে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAddress() {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("দয়া করে সব তথ্য পূরণ করুন")
      return
    }

    try {
      setLoading(true)
      const localAddresses = getLocalAddresses()

      if (editingId) {
        // Update existing
        const index = localAddresses.findIndex((a) => a.id === editingId)
        if (index !== -1) {
          localAddresses[index] = {
            ...localAddresses[index],
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            label: formData.label,
          }
        }
      } else {
        // Add new
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          label: formData.label,
          is_default: localAddresses.length === 0,
        }
        localAddresses.push(newAddress)
      }

      saveLocalAddresses(localAddresses)
      setAddresses(localAddresses)
      setFormData({ name: "", phone: "", address: "", label: "home" })
      setShowAddForm(false)
      setEditingId(null)
      alert("ঠিকানা সংরক্ষণ হয়েছে")
    } catch (error) {
      console.error("Error saving address:", error)
      alert("ঠিকানা সংরক্ষণে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  function handleEditAddress(addr: Address) {
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      label: addr.label,
    })
    setEditingId(addr.id)
    setShowAddForm(true)
  }

  function handleDeleteAddress(id: string) {
    if (!confirm("এই ঠিকানা মুছে ফেলতে চান?")) return

    const localAddresses = getLocalAddresses().filter((a) => a.id !== id)
    saveLocalAddresses(localAddresses)
    setAddresses(localAddresses)
  }

  function handleSetDefault(id: string) {
    const localAddresses = getLocalAddresses().map((a) => ({
      ...a,
      is_default: a.id === id,
    }))
    saveLocalAddresses(localAddresses)
    setAddresses(localAddresses)
  }

  const labelIcons: Record<string, React.ReactNode> = {
    home: <Home className="w-4 h-4" />,
    office: <Briefcase className="w-4 h-4" />,
    other: <Heart className="w-4 h-4" />,
  }

  const labelNames: Record<string, string> = {
    home: "বাসা",
    office: "অফিস",
    other: "অন্যান্য",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">শু</div>
          <span className="font-semibold text-lg">Shusto</span>
        </div>
        <h1 className="text-lg font-semibold ml-2">আমার প্রোফাইল</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            ব্যক্তিগত তথ্য
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="আপনার নাম"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর *</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-base"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল সংরক্ষণ করুন"}
            </button>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              ডেলিভারি ঠিকানা
            </h2>
            {!showAddForm && (
              <button
                onClick={() => {
                  setFormData({ name: "", phone: "", address: "", label: "home" })
                  setEditingId(null)
                  setShowAddForm(true)
                }}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                নতুন ঠিকানা
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-emerald-50/50 rounded-xl p-4 mb-4 border border-emerald-100">
              <h3 className="font-semibold text-gray-800 mb-3">{editingId ? "ঠিকানা সম্পাদনা" : "নতুন ঠিকানা যোগ করুন"}</h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="নাম *"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-base"
                />

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ফোন নম্বর *"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-base"
                />

                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="সম্পূর্ণ ঠিকানা *"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-base resize-none"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">লেবেল</label>
                  <div className="flex gap-2">
                    {["home", "office", "other"].map((label) => (
                      <button
                        key={label}
                        onClick={() => setFormData({ ...formData, label })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                          formData.label === label
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        {labelIcons[label]}
                        <span>{labelNames[label]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingId(null)
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>কোনো ঠিকানা সংরক্ষিত নেই</p>
              <p className="text-sm mt-1">নতুন ঠিকানা যোগ করুন যাতে দ্রুত অর্ডার করতে পারেন</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border transition-all ${
                    addr.is_default ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-600">{labelIcons[addr.label] || labelIcons.home}</span>
                        <span className="font-semibold text-gray-800">{addr.name}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            ডিফল্ট
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{addr.phone}</p>
                      <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                    </div>

                    <div className="flex gap-1">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="ডিফল্ট করুন"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
