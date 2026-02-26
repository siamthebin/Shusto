import DoctorRegistrationForm from "@/components/doctor-registration-form"

export default function DoctorRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">ডাক্তার রেজিস্ট্রেশন</h1>
          <p className="text-gray-600">আপনার প্রোফাইল তৈরি করুন এবং রোগীদের অনলাইন পরামর্শ দিন</p>
        </div>
        <DoctorRegistrationForm />
      </div>
    </div>
  )
}
