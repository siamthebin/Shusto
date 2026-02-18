"use client"

const partners = [
  {
    name: "ক্লাউড হেলথকেয়ার",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/530340486_18077767634492585_9166946750812307262_n-8h9B1WXxGh9SShKQHLvcSNzMv9a9Bd.jpg",
  },
  {
    name: "পপুলার ব্যাংক",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%2825%29-yZVaFvNUtsn0Izk5fE8glK7nckVQUo.png",
  },
  {
    name: "বারডেম",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/birdem-tGevMyIuNLAtFlyjoHVNM3Qw61B9db.jpg",
  },
  {
    name: "ইবনে সিনা",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%2826%29-nLFa7BHmI5ZmuSDljDuGTFMxnVAjnH.png",
  },
  {
    name: "ইসলামী ব্যাংক",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WycLLRaQGp-0Qq8nULhI8DCK91vpaNFc3kPzlDTkP.jpg",
  },
  {
    name: "ইসলামী ব্যাংক ফাউন্ডেশন হাসপাতাল",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile_logo-ZLLQoW8N0RcGEtqg8PU2UPjTc3POSv.png",
  },
]

export function PartnersSection() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">আমাদের পার্টনার</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">বাংলাদেশের শীর্ষস্থানীয় প্রতিষ্ঠানের বিশ্বস্ত</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className="flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                className="w-full h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
