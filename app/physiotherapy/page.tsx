"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Star, Calendar, Phone, Activity, Users, Shield, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import BalanceHeader from "@/components/kokonutui/balance-header"
import BottomNav from "@/components/kokonutui/bottom-nav"
import { CartDrawer } from "@/components/kokonutui/cart-drawer"
import type { CartItem } from "@/components/kokonutui/data"

export default function PhysiotherapyPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const categories = [
    { id: "all", name: "সব সেবা", icon: "🏥" },
    { id: "orthopedic", name: "অর্থোপেডিক", icon: "🦴" },
    { id: "neuro", name: "নিউরো", icon: "🧠" },
    { id: "sports", name: "স্পোর্টস", icon: "⚽" },
    { id: "pain", name: "ব্যথা চিকিৎসা", icon: "💪" },
  ]

  const services = [
    {
      id: 1,
      category: "orthopedic",
      name: "অর্থোপেডিক ফিজিওথেরাপি",
      description: "হাড়, জয়েন্ট ও মাংসপেশির সমস্যার জন্য বিশেষজ্ঞ চিকিৎসা",
      price: 1400,
      duration: "৪৫ মিনিট",
      rating: 4.8,
      reviews: 234,
      image: "/orthopedic-physiotherapy.png",
      features: ["জয়েন্ট মোবিলাইজেশন", "স্ট্রেচিং", "স্ট্রেংথেনিং", "পোস্চার কারেকশন"],
    },
    {
      id: 2,
      category: "orthopedic",
      name: "ব্যাক পেইন ফিজিওথেরাপি",
      description: "পিঠ ও কোমর ব্যথার জন্য বিশেষজ্ঞ চিকিৎসা ও এক্সারসাইজ",
      price: 1200,
      duration: "৪০ মিনিট",
      rating: 4.9,
      reviews: 312,
      image: "/back-pain-physiotherapy.jpg",
      features: ["স্পাইনাল মোবিলাইজেশন", "কোর স্ট্রেংথেনিং", "পোস্চার ট্রেনিং", "হোম এক্সারসাইজ"],
    },
    {
      id: 3,
      category: "orthopedic",
      name: "নি পেইন ট্রিটমেন্ট",
      description: "হাঁটু ব্যথা ও আর্থ্রাইটিসের জন্য বিশেষ ফিজিওথেরাপি",
      price: 1300,
      duration: "৪৫ মিনিট",
      rating: 4.7,
      reviews: 198,
      image: "/knee-pain-physiotherapy.jpg",
      features: ["কোয়াড্রিসেপ স্ট্রেংথেনিং", "জয়েন্ট মোবিলাইজেশন", "বালান্স ট্রেনিং", "পেইন ম্যানেজমেন্ট"],
    },
    {
      id: 4,
      category: "neuro",
      name: "স্ট্রোক রিহ্যাবিলিটেশন",
      description: "স্ট্রোক পরবর্তী পুনর্বাসন ও মুভমেন্ট থেরাপি",
      price: 1800,
      duration: "৬০ মিনিট",
      rating: 4.9,
      reviews: 156,
      image: "/stroke-rehabilitation-physiotherapy.jpg",
      features: ["মোটর রিকভারি", "ব্যালান্স ট্রেনিং", "গেইট ট্রেনিং", "ADL ট্রেনিং"],
    },
    {
      id: 5,
      category: "neuro",
      name: "প্যারালাইসিস ফিজিওথেরাপি",
      description: "পক্ষাঘাত রোগীদের জন্য বিশেষ থেরাপি ও এক্সারসাইজ",
      price: 1600,
      duration: "৫০ মিনিট",
      rating: 4.8,
      reviews: 134,
      image: "/placeholder.svg?height=200&width=300",
      features: ["প্যাসিভ মুভমেন্ট", "স্টিমুলেশন", "স্ট্রেচিং", "ফাংশনাল ট্রেনিং"],
    },
    {
      id: 6,
      category: "neuro",
      name: "পার্কিনসন্স থেরাপি",
      description: "পার্কিনসন্স রোগীদের জন্য মুভমেন্ট ও ব্যালান্স থেরাপি",
      price: 1700,
      duration: "৫০ মিনিট",
      rating: 4.7,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=300",
      features: ["LSVT BIG", "ব্যালান্স ট্রেনিং", "গেইট ট্রেনিং", "ফল প্রিভেনশন"],
    },
    {
      id: 7,
      category: "sports",
      name: "স্পোর্টস ইনজুরি ট্রিটমেন্ট",
      description: "খেলাধুলার আঘাত থেকে দ্রুত সুস্থতা ও রিহ্যাবিলিটেশন",
      price: 1500,
      duration: "৪৫ মিনিট",
      rating: 4.9,
      reviews: 267,
      image: "/placeholder.svg?height=200&width=300",
      features: ["ইনজুরি অ্যাসেসমেন্ট", "স্পোর্টস ম্যাসাজ", "টেপিং", "রিটার্ন টু স্পোর্ট"],
    },
    {
      id: 8,
      category: "sports",
      name: "অ্যাথলেটিক পারফরম্যান্স",
      description: "খেলোয়াড়দের জন্য পারফরম্যান্স এনহ্যান্সমেন্ট থেরাপি",
      price: 2000,
      duration: "৬০ মিনিট",
      rating: 4.8,
      reviews: 98,
      image: "/placeholder.svg?height=200&width=300",
      features: ["স্ট্রেংথ ট্রেনিং", "ফ্লেক্সিবিলিটি", "স্পিড ট্রেনিং", "ইনজুরি প্রিভেনশন"],
    },
    {
      id: 9,
      category: "pain",
      name: "সার্ভাইক্যাল পেইন ট্রিটমেন্ট",
      description: "ঘাড় ব্যথা ও সার্ভাইক্যাল স্পন্ডাইলোসিসের চিকিৎসা",
      price: 1200,
      duration: "৪০ মিনিট",
      rating: 4.8,
      reviews: 289,
      image: "/placeholder.svg?height=200&width=300",
      features: ["নেক মোবিলাইজেশন", "পোস্চার কারেকশন", "স্ট্রেচিং", "এর্গোনমিক অ্যাডভাইস"],
    },
    {
      id: 10,
      category: "pain",
      name: "ফ্রোজেন শোল্ডার থেরাপি",
      description: "কাঁধ জমে যাওয়ার জন্য বিশেষ মোবিলাইজেশন থেরাপি",
      price: 1400,
      duration: "৪৫ মিনিট",
      rating: 4.9,
      reviews: 178,
      image: "/placeholder.svg?height=200&width=300",
      features: ["জয়েন্ট মোবিলাইজেশন", "স্ট্রেচিং", "স্ট্রেংথেনিং", "হোম প্রোগ্রাম"],
    },
    {
      id: 11,
      category: "pain",
      name: "সায়াটিকা ট্রিটমেন্ট",
      description: "সায়াটিক নার্ভ ব্যথার জন্য বিশেষজ্ঞ ফিজিওথেরাপি",
      price: 1300,
      duration: "৪৫ মিনিট",
      rating: 4.8,
      reviews: 234,
      image: "/placeholder.svg?height=200&width=300",
      features: ["নার্ভ মোবিলাইজেশন", "স্পাইনাল ট্র্যাকশন", "কোর স্ট্রেংথেনিং", "পোস্চার ট্রেনিং"],
    },
    {
      id: 12,
      category: "orthopedic",
      name: "পোস্ট-সার্জারি রিহ্যাব",
      description: "অপারেশন পরবর্তী পুনর্বাসন ফিজিওথেরাপি",
      price: 1600,
      duration: "৫০ মিনিট",
      rating: 4.9,
      reviews: 145,
      image: "/placeholder.svg?height=200&width=300",
      features: ["ROM এক্সারসাইজ", "স্ট্রেংথেনিং", "স্কার টিস্যু ম্যানেজমেন্ট", "ফাংশনাল ট্রেনিং"],
    },
  ]

  const filteredServices =
    selectedCategory === "all" ? services : services.filter((service) => service.category === selectedCategory)

  const handleAddToCart = (service: (typeof services)[0]) => {
    const cartItem: CartItem = {
      id: `physio-${Date.now()}`,
      name: service.name,
      description: `${service.description} - ${service.duration}`,
      price: service.price,
      image: service.image,
      category: "physiotherapy",
      quantity: 1,
      prescription: false,
      inStock: true,
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.name === service.name)
      if (exists) {
        return prev.map((item) => (item.name === service.name ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, cartItem]
    })

    setIsCartOpen(true)
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <BalanceHeader cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4">
        <div className="flex items-center gap-3 max-w-screen-xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-teal-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ফিজিওথেরাপি সেবা</h1>
              <p className="text-sm text-teal-100">বাড়িতে পেশাদার ফিজিওথেরাপি</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">জরুরি সেবার জন্য কল করুন</p>
            <a href="tel:16263" className="text-red-600 font-bold text-xl">
              ১৬২৬৩
            </a>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-zinc-700">লাইসেন্সড থেরাপিস্ট</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-zinc-700">১০+ বছর অভিজ্ঞতা</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <Home className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-zinc-700">বাড়িতে সেবা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-teal-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4 max-w-screen-xl mx-auto">
        <p className="text-sm text-zinc-600 mb-4">{filteredServices.length} টি সেবা পাওয়া গেছে</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{service.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{service.name}</h3>
                <p className="text-sm text-zinc-600 mb-3">{service.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-zinc-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400">({service.reviews} রিভিউ)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-2xl font-bold text-teal-600">৳{service.price}</span>
                  </div>
                  <Button onClick={() => handleAddToCart(service)} className="bg-teal-600 hover:bg-teal-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    বুক করুন
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="p-4 max-w-screen-xl mx-auto">
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50">
          <h2 className="text-xl font-bold mb-4 text-zinc-900">কেন আমাদের ফিজিওথেরাপি সেবা?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">অভিজ্ঞ ও লাইসেন্সড থেরাপিস্ট</p>
                <p className="text-sm text-zinc-600">সকল থেরাপিস্ট BPT/MPT ডিগ্রিধারী এবং সরকারি লাইসেন্সপ্রাপ্ত</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">বাড়িতে সেবা</p>
                <p className="text-sm text-zinc-600">আপনার সুবিধামত সময়ে বাড়িতে থেরাপি সেশন</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">আধুনিক ইকুইপমেন্ট</p>
                <p className="text-sm text-zinc-600">থেরাপিস্টরা প্রয়োজনীয় সব ইকুইপমেন্ট সাথে নিয়ে আসেন</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Related Services Link */}
      <div className="p-4 max-w-screen-xl mx-auto">
        <Link href="/nursing">
          <Card className="p-4 bg-pink-50 border-pink-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">❤️</div>
                <div>
                  <p className="font-semibold text-pink-900">নার্সিং সেবাও দেখুন</p>
                  <p className="text-sm text-pink-700">বাড়িতে পেশাদার নার্সিং কেয়ার</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-pink-600 rotate-180" />
            </div>
          </Card>
        </Link>
      </div>

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}

      <BottomNav />
    </div>
  )
}
