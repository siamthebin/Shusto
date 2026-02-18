"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Star, Calendar, Phone, Heart, Users, Shield, Home, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import BalanceHeader from "@/components/kokonutui/balance-header"
import BottomNav from "@/components/kokonutui/bottom-nav"
import { CartDrawer } from "@/components/kokonutui/cart-drawer"
import type { CartItem } from "@/components/kokonutui/data"

export default function NursingPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const categories = [
    { id: "all", name: "সব সেবা", icon: "🏥" },
    { id: "home-nursing", name: "হোম নার্সিং", icon: "🏠" },
    { id: "icu-care", name: "আইসিইউ কেয়ার", icon: "💉" },
    { id: "elderly-care", name: "বয়স্ক সেবা", icon: "👴" },
    { id: "post-surgery", name: "অপারেশন পরবর্তী", icon: "🩹" },
  ]

  const services = [
    {
      id: 1,
      category: "home-nursing",
      name: "হোম নার্সিং সেবা (১২ ঘন্টা)",
      description: "বাড়িতে পেশাদার নার্সিং সেবা - ইনজেকশন, ড্রেসিং, ওষুধ ব্যবস্থাপনা",
      price: 2500,
      duration: "১২ ঘন্টা",
      rating: 4.9,
      reviews: 267,
      image: "/home-nursing-care-patient.jpg",
      features: ["রেজিস্টার্ড নার্স", "ইনজেকশন সেবা", "ড্রেসিং", "ওষুধ ব্যবস্থাপনা"],
    },
    {
      id: 2,
      category: "home-nursing",
      name: "হোম নার্সিং সেবা (২৪ ঘন্টা)",
      description: "সার্বক্ষণিক নার্সিং সেবা - রাত-দিন ২৪ ঘন্টা যত্ন",
      price: 4500,
      duration: "২৪ ঘন্টা",
      rating: 4.8,
      reviews: 198,
      image: "/24-hour-nursing-care.jpg",
      features: ["২৪/৭ মনিটরিং", "খাবার সহায়তা", "ব্যক্তিগত যত্ন", "ওষুধ প্রদান"],
    },
    {
      id: 3,
      category: "icu-care",
      name: "আইসিইউ ট্রেইনড নার্স",
      description: "গুরুতর রোগীর জন্য আইসিইউ অভিজ্ঞ বিশেষজ্ঞ নার্স",
      price: 5000,
      duration: "১২ ঘন্টা",
      rating: 5.0,
      reviews: 87,
      image: "/icu-trained-nurse.jpg",
      features: ["ভেন্টিলেটর কেয়ার", "ক্রিটিকাল কেয়ার", "মনিটরিং", "ইমার্জেন্সি হ্যান্ডলিং"],
    },
    {
      id: 4,
      category: "icu-care",
      name: "ভেন্টিলেটর সাপোর্ট নার্স",
      description: "ভেন্টিলেটর রোগীর জন্য বিশেষজ্ঞ নার্সিং সেবা",
      price: 6000,
      duration: "১২ ঘন্টা",
      rating: 4.9,
      reviews: 56,
      image: "/ventilator-patient-care-nurse.jpg",
      features: ["ভেন্টিলেটর ম্যানেজমেন্ট", "সাকশনিং", "পজিশনিং", "মনিটরিং"],
    },
    {
      id: 5,
      category: "elderly-care",
      name: "বয়স্ক সেবা (দিনের বেলা)",
      description: "বয়স্ক মানুষের জন্য বিশেষ যত্ন ও সঙ্গ",
      price: 2000,
      duration: "১২ ঘন্টা",
      rating: 4.8,
      reviews: 312,
      image: "/elderly-care-nursing.jpg",
      features: ["সঙ্গ দেওয়া", "খাবার সহায়তা", "হাঁটাচলায় সাহায্য", "ওষুধ মনে করানো"],
    },
    {
      id: 6,
      category: "elderly-care",
      name: "বয়স্ক সেবা (২৪ ঘন্টা)",
      description: "সার্বক্ষণিক বয়স্ক যত্ন - রাত ও দিন",
      price: 3500,
      duration: "২৪ ঘন্টা",
      rating: 4.9,
      reviews: 189,
      image: "/24-hour-elderly-care.jpg",
      features: ["২৪/৭ সঙ্গ", "রাতের যত্ন", "ব্যক্তিগত পরিচর্যা", "মানসিক সাপোর্ট"],
    },
    {
      id: 7,
      category: "post-surgery",
      name: "পোস্ট-সার্জারি নার্সিং",
      description: "অপারেশন পরবর্তী বিশেষ যত্ন ও পুনর্বাসন",
      price: 3000,
      duration: "১২ ঘন্টা",
      rating: 4.9,
      reviews: 145,
      image: "/post-surgery-nursing-care.jpg",
      features: ["ড্রেসিং চেঞ্জ", "ওষুধ ব্যবস্থাপনা", "মুভমেন্ট সহায়তা", "ডাক্তারের সাথে যোগাযোগ"],
    },
    {
      id: 8,
      category: "post-surgery",
      name: "সিজারিয়ান আফটার কেয়ার",
      description: "সিজারিয়ান অপারেশন পরবর্তী মা ও শিশুর যত্ন",
      price: 3500,
      duration: "১২ ঘন্টা",
      rating: 5.0,
      reviews: 234,
      image: "/cesarean-after-care-mother-baby.jpg",
      features: ["মায়ের যত্ন", "শিশুর যত্ন", "ব্রেস্টফিডিং সাপোর্ট", "ড্রেসিং"],
    },
    {
      id: 9,
      category: "home-nursing",
      name: "ইনজেকশন সেবা (বাড়িতে)",
      description: "বাড়িতে ইনজেকশন প্রদান - IV, IM, SC",
      price: 300,
      duration: "৩০ মিনিট",
      rating: 4.7,
      reviews: 521,
      image: "/home-injection-service-nurse.jpg",
      features: ["IV ইনজেকশন", "IM ইনজেকশন", "SC ইনজেকশন", "স্যালাইন"],
    },
    {
      id: 10,
      category: "home-nursing",
      name: "ড্রেসিং সেবা",
      description: "ক্ষত পরিচর্যা ও ড্রেসিং চেঞ্জ",
      price: 500,
      duration: "৪৫ মিনিট",
      rating: 4.8,
      reviews: 412,
      image: "/wound-dressing-nursing.jpg",
      features: ["ক্ষত পরিষ্কার", "ড্রেসিং চেঞ্জ", "স্টিচ কেয়ার", "রিপোর্ট"],
    },
    {
      id: 11,
      category: "home-nursing",
      name: "ক্যাথেটার সেবা",
      description: "ক্যাথেটার ইনসার্শন, চেঞ্জ ও কেয়ার",
      price: 800,
      duration: "৪৫ মিনিট",
      rating: 4.9,
      reviews: 178,
      image: "/catheter-care-nursing.jpg",
      features: ["ক্যাথেটার ইনসার্শন", "ক্যাথেটার চেঞ্জ", "ব্যাগ চেঞ্জ", "কেয়ার গাইডলাইন"],
    },
    {
      id: 12,
      category: "elderly-care",
      name: "ডিমেনশিয়া কেয়ার",
      description: "ডিমেনশিয়া/আলঝেইমার রোগীর জন্য বিশেষ যত্ন",
      price: 4000,
      duration: "১২ ঘন্টা",
      rating: 4.8,
      reviews: 98,
      image: "/dementia-care-nursing.jpg",
      features: ["মেমোরি সাপোর্ট", "সেফটি মনিটরিং", "অ্যাক্টিভিটি এনগেজমেন্ট", "ফ্যামিলি সাপোর্ট"],
    },
  ]

  const filteredServices =
    selectedCategory === "all" ? services : services.filter((service) => service.category === selectedCategory)

  const handleAddToCart = (service: (typeof services)[0]) => {
    const cartItem: CartItem = {
      id: `nursing-${Date.now()}`,
      name: service.name,
      description: `${service.description} - ${service.duration}`,
      price: service.price,
      image: service.image,
      category: "nursing",
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
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-4">
        <div className="flex items-center gap-3 max-w-screen-xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-pink-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">নার্সিং সেবা</h1>
              <p className="text-sm text-pink-100">বাড়িতে পেশাদার নার্সিং কেয়ার</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">জরুরি নার্সিং সেবার জন্য কল করুন</p>
            <a href="tel:16263" className="text-red-600 font-bold text-xl">
              ১৬২৬৩
            </a>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-xs font-medium text-zinc-700">ভেরিফাইড নার্স</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-xs font-medium text-zinc-700">অভিজ্ঞ টিম</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <Home className="w-5 h-5 text-pink-600" />
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
                  ? "bg-pink-600 text-white"
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
                    <span key={idx} className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
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
                    <span className="text-2xl font-bold text-pink-600">৳{service.price}</span>
                  </div>
                  <Button onClick={() => handleAddToCart(service)} className="bg-pink-600 hover:bg-pink-700">
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
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50">
          <h2 className="text-xl font-bold mb-4 text-zinc-900">কেন আমাদের নার্সিং সেবা?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">রেজিস্টার্ড ও ভেরিফাইড নার্স</p>
                <p className="text-sm text-zinc-600">সকল নার্স সরকারি রেজিস্ট্রেশন ও ব্যাকগ্রাউন্ড চেকড</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">২৪/৭ সেবা</p>
                <p className="text-sm text-zinc-600">দিন-রাত যেকোনো সময় নার্সিং সেবা পাওয়া যায়</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-zinc-900">স্বচ্ছ মূল্য</p>
                <p className="text-sm text-zinc-600">কোনো হিডেন চার্জ নেই, সব খরচ আগেই জানানো হয়</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Related Services Link */}
      <div className="p-4 max-w-screen-xl mx-auto">
        <Link href="/physiotherapy">
          <Card className="p-4 bg-teal-50 border-teal-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-teal-900">ফিজিওথেরাপি সেবাও দেখুন</p>
                  <p className="text-sm text-teal-700">বাড়িতে ফিজিওথেরাপি সেবা</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-teal-600 rotate-180" />
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
