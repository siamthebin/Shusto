import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-800">সফলভাবে সাইন আপ হয়েছে!</CardTitle>
            <CardDescription>আপনার ইমেইল যাচাই করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। লগইন করার আগে অনুগ্রহ করে আপনার ইমেইল চেক করে অ্যাকাউন্ট যাচাই করুন।
            </p>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/login">লগইন পেজে যান</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
