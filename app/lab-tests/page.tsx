"use client"

import {
  TestTube,
  Microscope,
  Activity,
  Scan,
  Clock,
  MapPin,
  Heart,
  Baby,
  Droplet,
  Pill,
  Stethoscope,
  Brain,
  Bone,
  Eye,
} from "lucide-react"
import { useState, useEffect } from "react"
import BalanceHeader from "@/components/kokonutui/balance-header"
import BottomNav from "@/components/kokonutui/bottom-nav"
import { CartDrawer } from "@/components/kokonutui/cart-drawer"
import type { CartItem } from "@/components/kokonutui/data"

export default function LabTestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shusto_lab_cart")
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error("Error loading lab cart:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shusto_lab_cart", JSON.stringify(cart))
    }
  }, [cart])

  const testCategories = [
    {
      name: "রক্ত পরীক্ষা",
      icon: TestTube,
      tests: [
        "Complete Blood Count (CBC)",
        "Blood Sugar (Fasting/Random/HbA1c)",
        "Lipid Profile",
        "Liver Function Test (LFT)",
        "Kidney Function Test (KFT)",
        "Thyroid Function Test (T3, T4, TSH)",
        "Vitamin D Test",
        "Vitamin B12 Test",
        "Iron Studies (Serum Iron, TIBC, Ferritin)",
        "Electrolytes (Na, K, Cl)",
        "Blood Group & Rh Factor",
        "ESR (Erythrocyte Sedimentation Rate)",
        "CRP (C-Reactive Protein)",
        "Dengue Test (NS1, IgG, IgM)",
        "Malaria Test",
        "Typhoid Test (Widal)",
        "HIV Test",
        "Hepatitis B & C Test",
        "VDRL (Syphilis Test)",
      ],
      color: "bg-red-50 text-red-600",
    },
    {
      name: "ইমেজিং টেস্ট",
      icon: Scan,
      tests: [
        "X-Ray (Chest, Abdomen, Bone)",
        "Ultrasound (Whole Abdomen, Pelvis, Pregnancy)",
        "CT Scan (Brain, Chest, Abdomen)",
        "MRI (Brain, Spine, Joint)",
        "Mammography",
        "DEXA Scan (Bone Density)",
        "PET Scan",
        "Doppler Ultrasound",
        "Echocardiography (2D Echo)",
        "TMT (Treadmill Test)",
      ],
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "প্যাথলজি টেস্ট",
      icon: Microscope,
      tests: [
        "Urine Routine & Microscopy",
        "Urine Culture & Sensitivity",
        "24-Hour Urine Protein",
        "Stool Routine & Microscopy",
        "Stool Culture",
        "Occult Blood Test",
        "Semen Analysis",
        "Pap Smear",
        "Biopsy (Tissue Examination)",
        "FNAC (Fine Needle Aspiration)",
        "Blood Culture",
        "Throat Swab Culture",
        "Wound Culture",
      ],
      color: "bg-purple-50 text-purple-600",
    },
    {
      name: "হার্ট টেস্ট",
      icon: Heart,
      tests: [
        "ECG (Electrocardiogram)",
        "2D Echo (Echocardiography)",
        "Stress Test (TMT)",
        "Holter Monitor (24-Hour ECG)",
        "Cardiac Enzymes (Troponin, CPK-MB)",
        "Lipid Profile",
        "Homocysteine",
        "NT-proBNP",
      ],
      color: "bg-pink-50 text-pink-600",
    },
    {
      name: "হরমোন টেস্ট",
      icon: Activity,
      tests: [
        "Thyroid Profile (T3, T4, TSH)",
        "Testosterone",
        "Estrogen & Progesterone",
        "FSH & LH",
        "Prolactin",
        "Cortisol",
        "Growth Hormone",
        "DHEA-S",
        "AMH (Anti-Mullerian Hormone)",
        "Insulin Fasting",
      ],
      color: "bg-orange-50 text-orange-600",
    },
    {
      name: "ক্যান্সার মার্কার",
      icon: Stethoscope,
      tests: [
        "PSA (Prostate Cancer)",
        "CA 125 (Ovarian Cancer)",
        "CA 19-9 (Pancreatic Cancer)",
        "CEA (Colorectal Cancer)",
        "AFP (Liver Cancer)",
        "CA 15-3 (Breast Cancer)",
        "Beta HCG (Testicular Cancer)",
      ],
      color: "bg-teal-50 text-teal-600",
    },
    {
      name: "প্রেগনেন্সি টেস্ট",
      icon: Baby,
      tests: [
        "Pregnancy Test (Urine/Blood)",
        "Beta HCG",
        "Double Marker Test",
        "Triple Marker Test",
        "Quadruple Marker Test",
        "NIPT (Non-Invasive Prenatal Test)",
        "Amniocentesis",
        "Glucose Tolerance Test (GTT)",
        "Obstetric Ultrasound",
      ],
      color: "bg-pink-50 text-pink-600",
    },
    {
      name: "অ্যালার্জি টেস্ট",
      icon: Droplet,
      tests: [
        "IgE Total",
        "Food Allergy Panel",
        "Inhalant Allergy Panel",
        "Drug Allergy Test",
        "Skin Prick Test",
        "Patch Test",
      ],
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      name: "COVID-19 টেস্ট",
      icon: Pill,
      tests: ["RT-PCR Test", "Rapid Antigen Test", "Antibody Test (IgG/IgM)", "COVID-19 Package"],
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      name: "অটোইমিউন টেস্ট",
      icon: Brain,
      tests: [
        "ANA (Antinuclear Antibody)",
        "Anti-dsDNA",
        "Rheumatoid Factor (RF)",
        "Anti-CCP",
        "Anti-TPO (Thyroid)",
        "Celiac Disease Panel",
      ],
      color: "bg-violet-50 text-violet-600",
    },
    {
      name: "হাড় ও জয়েন্ট টেস্ট",
      icon: Bone,
      tests: [
        "Calcium",
        "Vitamin D",
        "Phosphorus",
        "Alkaline Phosphatase",
        "Uric Acid",
        "RA Factor",
        "DEXA Scan",
        "X-Ray (Joint/Bone)",
      ],
      color: "bg-stone-50 text-stone-600",
    },
    {
      name: "চোখ ও কান টেস্ট",
      icon: Eye,
      tests: [
        "Vision Test",
        "Retinal Examination",
        "Tonometry (Eye Pressure)",
        "Audiometry (Hearing Test)",
        "Tympanometry",
      ],
      color: "bg-cyan-50 text-cyan-600",
    },
  ]

  const popularTests = [
    { name: "Complete Blood Count (CBC)", price: "৳৩৫০", time: "২৪ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Blood Sugar (Fasting)", price: "৳২০০", time: "১২ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Lipid Profile", price: "৳৮০০", time: "২৪ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Thyroid Function Test (T3, T4, TSH)", price: "৳১২০০", time: "৪৮ ঘন্টা", category: "হরমোন টেস্ট" },
    { name: "Liver Function Test (LFT)", price: "৳৯০০", time: "২৪ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Kidney Function Test (KFT)", price: "৳৭৫০", time: "২৪ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "HbA1c (Diabetes Control)", price: "৳৬০০", time: "২৪ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Vitamin D Test", price: "৳১৫০০", time: "৪৮ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Ultrasound (Whole Abdomen)", price: "৳১২০০", time: "সাথে সাথে", category: "ইমেজিং টেস্ট" },
    { name: "ECG (Electrocardiogram)", price: "৳৩০০", time: "সাথে সাথে", category: "হার্ট টেস্ট" },
    { name: "X-Ray (Chest)", price: "৳৪০০", time: "সাথে সাথে", category: "ইমেজিং টেস্ট" },
    { name: "Urine Routine & Microscopy", price: "৳২৫০", time: "১২ ঘন্টা", category: "প্যাথলজি টেস্ট" },
    { name: "COVID-19 RT-PCR", price: "৳১৫০০", time: "২৪ ঘন্টা", category: "COVID-19 টেস্ট" },
    { name: "Dengue NS1 Antigen", price: "৳৮০০", time: "১২ ঘন্টা", category: "রক্ত পরীক্ষা" },
    { name: "Pregnancy Test (Beta HCG)", price: "৳৫০০", time: "২৪ ঘন্টা", category: "প্রেগনেন্সি টেস্ট" },
  ]

  const healthPackages = [
    { name: "বেসিক হেলথ চেকআপ", tests: "CBC, Blood Sugar, Lipid Profile, LFT, KFT", price: "৳২৫০০", discount: "৳৩৫০০" },
    {
      name: "ডায়াবেটিস প্যাকেজ",
      tests: "Fasting Sugar, PP Sugar, HbA1c, Lipid Profile, KFT",
      price: "৳২০০০",
      discount: "৳৩০০০",
    },
    { name: "থাইরয়েড প্যাকেজ", tests: "T3, T4, TSH, Anti-TPO", price: "৳১৮০০", discount: "৳২৫০০" },
    {
      name: "হার্ট হেলথ প্যাকেজ",
      tests: "ECG, 2D Echo, Lipid Profile, Cardiac Enzymes",
      price: "৳৪৫০০",
      discount: "৳৬০০০",
    },
    {
      name: "ফুল বডি চেকআপ",
      tests: "CBC, LFT, KFT, Lipid, Thyroid, Vitamin D, X-Ray, ECG",
      price: "৳৫৫০০",
      discount: "৳৮০০০",
    },
  ]

  const convertBengaliToEnglish = (str: string): string => {
    const bengaliNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    const englishNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

    let result = str
    bengaliNumerals.forEach((bengali, index) => {
      result = result.replace(new RegExp(bengali, "g"), englishNumerals[index])
    })
    return result
  }

  const handleAddToCart = (test: { name: string; price: string; time: string; category: string }) => {
    const priceString = convertBengaliToEnglish(test.price.replace(/[৳,]/g, ""))
    const priceNumber = Number.parseInt(priceString)

    const cartItem: CartItem = {
      id: `test-${Date.now()}`,
      name: test.name,
      description: `${test.category} - রিপোর্ট: ${test.time}`,
      price: priceNumber,
      image: "/medical-test.jpg",
      category: test.category,
      quantity: 1,
      prescription: false,
      inStock: true,
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.name === test.name)
      let newCart
      if (exists) {
        newCart = prev.map((item) => (item.name === test.name ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        newCart = [...prev, cartItem]
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_lab_cart", JSON.stringify(newCart))
      }
      return newCart
    })

    setIsCartOpen(true)
  }

  const handleAddPackageToCart = (pkg: { name: string; tests: string; price: string; discount: string }) => {
    const priceString = convertBengaliToEnglish(pkg.price.replace(/[৳,]/g, ""))
    const priceNumber = Number.parseInt(priceString)

    const cartItem: CartItem = {
      id: `package-${Date.now()}`,
      name: pkg.name,
      description: pkg.tests,
      price: priceNumber,
      image: "/health-package.jpg",
      category: "হেলথ প্যাকেজ",
      quantity: 1,
      prescription: false,
      inStock: true,
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.name === pkg.name)
      let newCart
      if (exists) {
        newCart = prev.map((item) => (item.name === pkg.name ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        newCart = [...prev, cartItem]
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_lab_cart", JSON.stringify(newCart))
      }
      return newCart
    })

    setIsCartOpen(true)
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId)
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_lab_cart", JSON.stringify(newCart))
      }
      return newCart
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      const newCart = prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      if (typeof window !== "undefined") {
        localStorage.setItem("shusto_lab_cart", JSON.stringify(newCart))
      }
      return newCart
    })
  }

  const filteredTests = selectedCategory
    ? popularTests.filter((test) => test.category === selectedCategory)
    : popularTests

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <BalanceHeader cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />

      {/* Header */}
      <div className="bg-emerald-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">ল্যাব ও ইমেজিং টেস্ট</h1>
        <p className="text-emerald-100">ঘরে বসে স্যাম্পল সংগ্রহ এবং দ্রুত রিপোর্ট</p>
      </div>

      {/* Features */}
      <div className="bg-white border-b border-zinc-200 p-4">
        <div className="grid grid-cols-3 gap-4 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs text-zinc-600">হোম স্যাম্পল কালেকশন</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs text-zinc-600">দ্রুত রিপোর্ট ডেলিভারি</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <TestTube className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs text-zinc-600">NABL সার্টিফাইড ল্যাব</p>
          </div>
        </div>
      </div>

      {/* Test Categories */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">টেস্ট ক্যাটাগরি</h2>
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {testCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="bg-white rounded-lg p-4 border border-zinc-200 hover:shadow-md transition-shadow cursor-pointer min-w-[160px]"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2 text-sm">{category.name}</h3>
                  <p className="text-xs text-zinc-500">{category.tests.length} টেস্ট</p>
                </div>
              )
            })}
          </div>
        </div>

        {selectedCategory && (
          <div className="mt-4 mb-4">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <span className="text-sm font-medium text-emerald-900">{selectedCategory} এর টেস্ট সমূহ</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                সব দেখুন
              </button>
            </div>
          </div>
        )}

        {selectedCategory && (
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-3">{selectedCategory}</h3>
              <ul className="space-y-2">
                {testCategories
                  .find((cat) => cat.name === selectedCategory)
                  ?.tests.map((test) => (
                    <li key={test} className="flex items-start text-sm text-zinc-700">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>{test}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Popular Tests */}
        <h2 className="text-lg font-bold text-zinc-900 mb-4 mt-6">
          {selectedCategory ? "সংশ্লিষ্ট টেস্ট" : "জনপ্রিয় টেস্ট"}
        </h2>
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.name}
              className="bg-white rounded-lg p-4 border border-zinc-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900">{test.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{test.category}</p>
                </div>
                <span className="text-emerald-600 font-bold">{test.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-zinc-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>রিপোর্ট: {test.time}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(test)}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  বুক করুন
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-zinc-900 mb-4 mt-8">হেলথ প্যাকেজ</h2>
        <div className="space-y-3">
          {healthPackages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-zinc-900">{pkg.name}</h3>
                <div className="text-right">
                  <div className="text-emerald-600 font-bold text-lg">{pkg.price}</div>
                  <div className="text-xs text-zinc-500 line-through">{pkg.discount}</div>
                </div>
              </div>
              <p className="text-sm text-zinc-600 mb-3">{pkg.tests}</p>
              <button
                onClick={() => handleAddPackageToCart(pkg)}
                className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                প্যাকেজ বুক করুন
              </button>
            </div>
          ))}
        </div>
      </div>

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
