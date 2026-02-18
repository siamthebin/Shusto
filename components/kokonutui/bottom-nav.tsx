"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Pill, Stethoscope, FileText, FlaskConical, Activity, Briefcase } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "হোম",
      href: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "ওষুধ",
      href: "/medicines",
      icon: <Pill className="w-5 h-5" />,
    },
    {
      name: "ডাক্তার",
      href: "/doctors",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      name: "সব সেবা",
      href: "/providers",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "প্রেসক্রিপশন",
      href: "/my-prescriptions",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "ল্যাব টেস্ট",
      href: "/lab-tests",
      icon: <FlaskConical className="w-5 h-5" />,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-6 items-center h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                isActive ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
              }`}
            >
              <div className={`mb-0.5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}>{item.icon}</div>
              <span className={`text-[10px] leading-tight text-center ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
