"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Stethoscope, Calendar, Users, Video, Settings, TrendingUp } from "lucide-react"

export default function DoctorPortalPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-emerald-600">Shusto</span>
              <span className="text-xs text-gray-500">ডাক্তার পোর্টাল</span>
            </div>
          </Link>

          <Link href="/doctor-portal/login">
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              লগইন করুন
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">ডাক্তারদের জন্য বিশেষ পোর্টাল</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              আপনার রোগীদের সাথে সরাসরি ভিডিও কল করুন, অ্যাপয়েন্টমেন্ট পরিচালনা করুন এবং আয় ট্র্যাক করুন
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/doctor-portal/login">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-lg">
                  ডাক্তার লগইন
                </Button>
              </Link>
              <Link href="/doctor-portal/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 h-12 px-8 text-lg bg-transparent"
                >
                  নতুন রেজিস্ট্রেশন
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <Video className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">লাইভ ভিডিও কনসালটেশন</CardTitle>
                <CardDescription>রোগীদের সাথে সরাসরি ভিডিও কলে পরামর্শ দিন</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <Calendar className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">অ্যাপয়েন্টমেন্ট ম্যানেজমেন্ট</CardTitle>
                <CardDescription>আপনার সময়সূচী সহজে পরিচালনা করুন</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <Users className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">রোগী ইতিহাস</CardTitle>
                <CardDescription>সম্পূর্ণ রোগী রেকর্ড এক জায়গায়</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">আয়ের হিসাব</CardTitle>
                <CardDescription>মাসিক আয় ও পেমেন্ট ট্র্যাক করুন</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <Settings className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">প্রফাইল সেটআপ</CardTitle>
                <CardDescription>আপনার প্রফেশনাল প্রফাইল তৈরি করুন</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-emerald-300 transition-all hover:shadow-lg">
              <CardHeader>
                <Stethoscope className="w-12 h-12 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">সহজ ব্যবহার</CardTitle>
                <CardDescription>ইউজার-ফ্রেন্ডলি ইন্টারফেস</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Section */}
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-emerald-100">রেজিস্টার্ড ডাক্তার</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-emerald-100">সফল কনসালটেশন</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">4.8★</div>
                  <div className="text-emerald-100">গড় রেটিং</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Shusto. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  )
}
