"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveFromCart: (id: string) => void
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveFromCart }: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [nearestPharmacy, setNearestPharmacy] = useState<any>(null)
  const [nearestLab, setNearestLab] = useState<any>(null)
  const [nearestPhysio, setNearestPhysio] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      // Try localStorage first
      const savedProfile = localStorage.getItem("shusto_user_profile")
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        setCustomerName(profile.fullName || "")
        setCustomerPhone(profile.phone || "")
      }

      const savedAddresses = localStorage.getItem("shusto_user_addresses")
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses)
        const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0]
        if (defaultAddress) {
          setUserAddress(`${defaultAddress.name}, ${defaultAddress.address}, ${defaultAddress.phone}`)
        }
      }
    }
    loadProfile()
  }, [isOpen])

  const findNearestProviders = async () => {
    setLoadingLocation(true)
    try {
      if (!navigator.geolocation) {
        loadFallbackProviders()
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          setUserLocation({ lat: userLat, lng: userLng })

          const isLabOrder = cart.some((item) => item.category?.includes("টেস্ট"))
          const isPhysioOrder = cart.some((item) => item.category?.includes("ফিজিও"))

          // Find pharmacies for medicine orders
          if (!isLabOrder && !isPhysioOrder) {
            const { data: pharmacies } = await supabase.from("pharmacies").select("*")
            if (pharmacies?.length) {
              let nearest = pharmacies[0]
              let minDistance = Infinity
              pharmacies.forEach((ph) => {
                if (ph.latitude && ph.longitude) {
                  const dist = calculateDistance(userLat, userLng, ph.latitude, ph.longitude)
                  if (dist < minDistance) {
                    minDistance = dist
                    nearest = { ...ph, distance: dist.toFixed(2) }
                  }
                }
              })
              setNearestPharmacy(nearest)
            }
          }

          // Find labs for lab orders
          if (isLabOrder) {
            const { data: labs } = await supabase.from("labs").select("*")
            if (labs?.length) {
              let nearest = labs[0]
              let minDistance = Infinity
              labs.forEach((lab) => {
                if (lab.latitude && lab.longitude) {
                  const dist = calculateDistance(userLat, userLng, lab.latitude, lab.longitude)
                  if (dist < minDistance) {
                    minDistance = dist
                    nearest = { ...lab, distance: dist.toFixed(2) }
                  }
                }
              })
              setNearestLab(nearest)
            }
          }

          // Find physios for physio orders
          if (isPhysioOrder) {
            const { data: physios } = await supabase.from("physiotherapists").select("*")
            if (physios?.length) {
              let nearest = physios[0]
              let minDistance = Infinity
              physios.forEach((physio) => {
                if (physio.latitude && physio.longitude) {
                  const dist = calculateDistance(userLat, userLng, physio.latitude, physio.longitude)
                  if (dist < minDistance) {
                    minDistance = dist
                    nearest = { ...physio, distance: dist.toFixed(2) }
                  }
                }
              })
              setNearestPhysio(nearest)
            }
          }

          setLoadingLocation(false)
        },
        () => {
          loadFallbackProviders()
        },
      )
    } catch (error) {
      console.error("Error finding providers:", error)
      loadFallbackProviders()
    }
  }

  const loadFallbackProviders = async () => {
    try {
      const isLabOrder = cart.some((item) => item.category?.includes("টেস্ট"))
      const isPhysioOrder = cart.some((item) => item.category?.includes("ফিজিও"))

      if (!isLabOrder && !isPhysioOrder) {
        const { data: pharmacies } = await supabase.from("pharmacies").select("*").limit(1)
        if (pharmacies?.length) setNearestPharmacy(pharmacies[0])
      }

      if (isLabOrder) {
        const { data: labs } = await supabase.from("labs").select("*").limit(1)
        if (labs?.length) setNearestLab(labs[0])
      }

      if (isPhysioOrder) {
        const { data: physios } = await supabase.from("physiotherapists").select("*").limit(1)
        if (physios?.length) setNearestPhysio(physios[0])
      }
    } catch (error) {
      console.error("Error loading fallback providers:", error)
    }
    setLoadingLocation(false)
  }

  // Find nearest providers when checkout starts
  useEffect(() => {
    if (showCheckout) {
      findNearestProviders()
    }
  }, [showCheckout])

  function saveOrderToLocalStorage(orderType: string) {
    const orderData = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total,
      customerName,
      customerPhone,
      address: userAddress,
      paymentMethod,
      status: "pending",
      createdAt: new Date().toISOString(),
      type: orderType,
      assignedPharmacy: nearestPharmacy
        ? {
            id: nearestPharmacy.id,
            name: nearestPharmacy.name,
            phone: nearestPharmacy.phone,
            address: nearestPharmacy.address,
            distance: nearestPharmacy.distance,
          }
        : null,
    }

    const storageKey = orderType === "lab" ? "shusto_lab_orders" : "shusto_medicine_orders"
    const existingOrders = JSON.parse(localStorage.getItem(storageKey) || "[]")
    existingOrders.unshift(orderData)
    localStorage.setItem(storageKey, JSON.stringify(existingOrders))

    return orderData.id
  }

  async function handleCheckoutSubmit() {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("দয়া করে নাম এবং ফোন নম্বর পূরণ করুন")
      return
    }

    if (!userAddress.trim()) {
      alert("দয়া করে ডেলিভারি ঠিকানা লিখুন")
      return
    }

    setShowCheckout(false)
    setShowPayment(true)
  }

  async function handlePaymentConfirm() {
    if (!paymentMethod) {
      alert("দয়া করে পেমেন্ট পদ্ধতি নির্বাচন করুন")
      return
    }

    setSubmitting(true)

    const isLabOrder = cart.some((item) => item.category?.includes("টেস্ট") || item.category?.includes("প্যাকেজ"))
    const isPhysioOrder = cart.some((item) => item.category?.includes("ফিজিও"))
    const orderType = isLabOrder ? "lab" : isPhysioOrder ? "physio" : "medicine"

    try {
      // For lab orders, assign to nearest lab
      const assignedLabId = isLabOrder ? nearestLab?.id || null : null
      const assignedLabName = isLabOrder ? nearestLab?.name || null : null
      
      // For physio orders, assign to nearest physio
      const assignedPhysioId = isPhysioOrder ? nearestPhysio?.id || null : null
      const assignedPhysioName = isPhysioOrder ? nearestPhysio?.name || null : null

      // Try database first
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: userAddress,
          total_amount: total,
          status: "pending",
          payment_method: paymentMethod,
          order_type: orderType,
          assigned_pharmacy_id: nearestPharmacy?.id || null,
          assigned_pharmacy_name: nearestPharmacy?.name || null,
          assigned_lab_id: assignedLabId,
          assigned_lab_name: assignedLabName,
          assigned_physio_id: assignedPhysioId,
          assigned_physio_name: assignedPhysioName,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        medicine_name: item.name,
        medicine_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))

      await supabase.from("order_items").insert(orderItems)

      saveOrderToLocalStorage(orderType)
      setOrderId(order.id.toString().slice(-4))
      setOrderSuccess(true)
    } catch (error) {
      console.log("Database error, saving to localStorage:", error)
      const localOrderId = saveOrderToLocalStorage(orderType)
      setOrderId(localOrderId.slice(-4))
      setOrderSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (orderSuccess) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200 z-40" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-xl animate-in slide-in-from-right duration-300 z-50 overflow-y-auto">
          <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">অর্ডার সফল!</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে</p>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4 w-full">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">অর্ডার আইডি</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">#{orderId}</p>
            </div>

            {nearestPharmacy && (
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-4 w-full border border-teal-200">
                <p className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">
                  নিকটতম ফার্মেসি থেকে ডেলিভারি হবে
                </p>
                <p className="font-bold text-teal-800 dark:text-teal-200">{nearestPharmacy.name}</p>
                {nearestPharmacy.distance && (
                  <p className="text-xs text-teal-600 mt-1">{nearestPharmacy.distance} কি.মি. দূরে</p>
                )}
              </div>
            )}

            {nearestLab && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4 w-full border border-purple-200">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                  নিকটতম ল্যাব থেকে পরীক্ষা করা হবে
                </p>
                <p className="font-bold text-purple-800 dark:text-purple-200">{nearestLab.name}</p>
                {nearestLab.distance && (
                  <p className="text-xs text-purple-600 mt-1">{nearestLab.distance} কি.মি. দূরে</p>
                )}
              </div>
            )}

            {nearestPhysio && (
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 mb-4 w-full border border-pink-200">
                <p className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-1">
                  নিকটতম ফিজিওথেরাপিস্ট থেকে সেবা দেওয়া হবে
                </p>
                <p className="font-bold text-pink-800 dark:text-pink-200">{nearestPhysio.name}</p>
                {nearestPhysio.distance && (
                  <p className="text-xs text-pink-600 mt-1">{nearestPhysio.distance} কি.মি. দূরে</p>
                )}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6 w-full border border-amber-200">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {paymentMethod === "bkash" ? "bKash" : "Nagad"} এ ৳{total} পেমেন্ট করুন:
              </p>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">01XXXXXXXXX</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  cart.forEach((item) => onRemoveFromCart(item.id))
                  setOrderSuccess(false)
                  setShowPayment(false)
                  setShowCheckout(false)
                  onClose()
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                বন্ধ করুন
              </Button>
              <Button
                onClick={() => {
                  cart.forEach((item) => onRemoveFromCart(item.id))
                  window.location.href = "/my-orders"
                }}
                variant="outline"
                className="flex-1"
              >
                অর্ডার দেখুন
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-xl animate-in slide-in-from-right duration-300 z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {showPayment ? "পেমেন্ট" : showCheckout ? "চেকআউট" : `কার্ট (${cart.length})`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {showPayment ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border-2 border-emerald-600">
              <p className="text-sm font-bold text-black dark:text-white mb-2">পেমেন্ট করতে হবে</p>
              <p className="text-3xl font-bold text-emerald-600">৳{total}</p>
            </div>

            {nearestPharmacy && (
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200">
                <p className="text-xs font-bold text-teal-600 uppercase mb-1">ডেলিভারি ফার্মেসি</p>
                <p className="font-bold text-teal-800">{nearestPharmacy.name}</p>
                {nearestPharmacy.distance && (
                  <p className="text-xs text-teal-600">{nearestPharmacy.distance} কি.মি. দূরে</p>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-black dark:text-white mb-3">পেমেন্ট পদ্ধতি নির্বাচন করুন</p>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("bkash")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "bkash" ? "border-pink-600 bg-pink-50" : "border-zinc-200 hover:border-pink-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">bK</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-black">bKash</p>
                      <p className="text-sm text-zinc-600">মোবাইল পেমেন্ট</p>
                    </div>
                    {paymentMethod === "bkash" && (
                      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("nagad")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "nagad"
                      ? "border-orange-600 bg-orange-50"
                      : "border-zinc-200 hover:border-orange-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-black">Nagad</p>
                      <p className="text-sm text-zinc-600">মোবাইল পেমেন্ট</p>
                    </div>
                    {paymentMethod === "nagad" && (
                      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("sslcommerz")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "sslcommerz"
                      ? "border-blue-600 bg-blue-50"
                      : "border-zinc-200 hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SSL</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-black">SSLCommerz</p>
                      <p className="text-sm text-zinc-600">কার্ড ও ব্যাংকিং</p>
                    </div>
                    {paymentMethod === "sslcommerz" && (
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : showCheckout ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">নাম *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-black text-base"
                placeholder="আপনার নাম"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">ফোন নম্বর *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-black text-base"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">ডেলিভারি ঠিকানা *</label>
              <textarea
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-black text-base"
                rows={3}
                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
              />
            </div>

            {loadingLocation ? (
              <div className="bg-zinc-50 p-4 rounded-lg text-center">
                <p className="text-sm text-zinc-600">নিকটতম ফার্মেসি খোঁজা হচ্ছে...</p>
              </div>
            ) : (
              nearestPharmacy && (
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-xs font-bold text-teal-600 uppercase mb-1">নিকটতম ফার্মেসি</p>
                  <p className="font-bold text-teal-800">{nearestPharmacy.name}</p>
                  {nearestPharmacy.address && <p className="text-sm text-teal-600">{nearestPharmacy.address}</p>}
                  {nearestPharmacy.distance && (
                    <p className="text-xs text-teal-500 mt-1">{nearestPharmacy.distance} কি.মি. দূরে</p>
                  )}
                </div>
              )
            )}

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-black dark:text-white mb-2">অর্ডার সারাংশ</h3>
              <div className="space-y-1 text-sm text-black dark:text-zinc-300">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between font-medium">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-black dark:text-white mt-3 pt-3 border-t border-zinc-200">
                <span>মোট</span>
                <span>৳{total}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-zinc-500 font-medium">আপনার কার্ট খালি</p>
                <p className="text-sm text-zinc-400 mt-1">ওষুধ যোগ করতে ব্রাউজ করুন</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black dark:text-white text-sm">{item.name}</h4>
                      <p className="text-emerald-600 font-bold">৳{item.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-zinc-200 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-black dark:text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-zinc-200 rounded flex items-center justify-center"
                        >
                          +
                        </button>
                        <button onClick={() => onRemoveFromCart(item.id)} className="ml-auto text-red-500 text-sm">
                          মুছুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mb-16">
            {showPayment ? (
              <div className="space-y-2">
            {paymentMethod === "sslcommerz" ? (
              <button
                onClick={async () => {
                  if (!customerName.trim() || !customerPhone.trim()) {
                    alert("দয়া করে নাম এবং ফোন নম্বর পূরণ করুন")
                    return
                  }

                  // Store cart items for checkout page
                  localStorage.setItem(
                    "checkout_cart",
                    JSON.stringify({
                      items: cart,
                      total,
                      customerName,
                      customerPhone,
                      address: userAddress,
                    })
                  )

                  // Redirect to checkout
                  window.location.href = "/checkout"
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
              >
                SSLCommerz এ পেমেন্ট করুন →
              </button>
            ) : (
              <Button
                onClick={handlePaymentConfirm}
                disabled={submitting || !paymentMethod}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "প্রক্রিয়া করা হচ্ছে..." : "পেমেন্ট নিশ্চিত করুন"}
              </Button>
            )}
                <Button
                  onClick={() => {
                    setShowPayment(false)
                    setShowCheckout(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  পেছনে যান
                </Button>
              </div>
            ) : showCheckout ? (
              <div className="space-y-2">
                <Button
                  onClick={handleCheckoutSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-lg py-6"
                >
                  পেমেন্টে যান - ৳{total}
                </Button>
                <Button onClick={() => setShowCheckout(false)} variant="outline" className="w-full">
                  পেছনে যান
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold text-black dark:text-white">
                  <span>মোট</span>
                  <span>৳{total}</span>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-lg py-6"
                >
                  চেকআউট করুন
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
