// Revenue Sharing Configuration for Shusto App
// Updated according to new chart - Patient pays 100%, split between Shusto and Provider

export const REVENUE_SHARING = {
  // Pharmacy: 5% to Shusto, 95% to Provider
  PHARMACY: {
    providerShare: 0.95, // 95%
    shustoShare: 0.05, // 5%
    affordability: "High",
  },

  // Hospital (ISU/Cabin): 20% to Shusto, 80% to Provider
  HOSPITAL: {
    providerShare: 0.8, // 80%
    shustoShare: 0.2, // 20%
    affordability: "High",
  },

  // Doctor (Fee): 30% to Shusto, 70% to Provider
  DOCTOR: {
    providerShare: 0.7, // 70%
    shustoShare: 0.3, // 30%
    affordability: "Standard",
  },

  // Ambulance: 10% to Shusto, 90% to Provider
  AMBULANCE: {
    providerShare: 0.9, // 90%
    shustoShare: 0.1, // 10%
    affordability: "High",
  },

  // Lab (Tests): 25% to Shusto, 75% to Provider
  LAB: {
    providerShare: 0.75, // 75%
    shustoShare: 0.25, // 25%
    affordability: "Standard",
  },

  // Physio & Nurse: 35% to Shusto, 65% to Provider
  PHYSIO_NURSE: {
    providerShare: 0.65, // 65%
    shustoShare: 0.35, // 35%
    affordability: "Standard",
  },
}

export interface RevenueBreakdown {
  totalAmount: number
  providerShare: number
  shustoShare: number
  providerType: keyof typeof REVENUE_SHARING
}

export function calculateRevenue(amount: number, providerType: keyof typeof REVENUE_SHARING): RevenueBreakdown {
  const config = REVENUE_SHARING[providerType]

  return {
    totalAmount: amount,
    providerShare: Math.round(amount * config.providerShare * 100) / 100,
    shustoShare: Math.round(amount * config.shustoShare * 100) / 100,
    providerType,
  }
}

export interface DailySale {
  date: string // Format: DD/MM/YYYY
  totalAmount: number
  transactions: number
  shustoEarnings: number
  providerPayouts: number
  breakdown: {
    [key in keyof typeof REVENUE_SHARING]?: {
      amount: number
      count: number
    }
  }
}

// Get today's date in DD/MM/YYYY format
function getTodayDate(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, "0")
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

// Store transaction with revenue split and daily tracking
export function saveTransaction(transaction: {
  id: string
  amount: number
  providerType: keyof typeof REVENUE_SHARING
  providerId: string
  providerName: string
  userId: string
  description: string
}) {
  const revenue = calculateRevenue(transaction.amount, transaction.providerType)
  const today = getTodayDate()

  const fullTransaction = {
    ...transaction,
    providerShare: revenue.providerShare,
    shustoShare: revenue.shustoShare,
    createdAt: new Date().toISOString(),
    date: today,
    status: "completed",
  }

  // Save to localStorage - transactions
  const transactions = JSON.parse(localStorage.getItem("shusto_revenue_transactions") || "[]")
  transactions.unshift(fullTransaction)
  localStorage.setItem("shusto_revenue_transactions", JSON.stringify(transactions))

  // Update daily sales
  updateDailySales(fullTransaction)

  return fullTransaction
}

// Update daily sales tracking
function updateDailySales(transaction: any) {
  const dailySales = JSON.parse(localStorage.getItem("shusto_daily_sales") || "[]") as DailySale[]
  const today = transaction.date

  let todaySale = dailySales.find((s) => s.date === today)

  if (!todaySale) {
    todaySale = {
      date: today,
      totalAmount: 0,
      transactions: 0,
      shustoEarnings: 0,
      providerPayouts: 0,
      breakdown: {},
    }
    dailySales.unshift(todaySale)
  }

  // Update totals
  todaySale.totalAmount += transaction.amount
  todaySale.transactions += 1
  todaySale.shustoEarnings += transaction.shustoShare
  todaySale.providerPayouts += transaction.providerShare

  // Update breakdown by provider type
  if (!todaySale.breakdown[transaction.providerType as keyof typeof REVENUE_SHARING]) {
    todaySale.breakdown[transaction.providerType as keyof typeof REVENUE_SHARING] = {
      amount: 0,
      count: 0,
    }
  }
  todaySale.breakdown[transaction.providerType as keyof typeof REVENUE_SHARING]!.amount += transaction.amount
  todaySale.breakdown[transaction.providerType as keyof typeof REVENUE_SHARING]!.count += 1

  localStorage.setItem("shusto_daily_sales", JSON.stringify(dailySales))
}

// Get daily sales history
export function getDailySales(limit = 30): DailySale[] {
  const dailySales = JSON.parse(localStorage.getItem("shusto_daily_sales") || "[]") as DailySale[]
  return dailySales.slice(0, limit)
}

// Get today's sales
export function getTodaySales(): DailySale | null {
  const dailySales = JSON.parse(localStorage.getItem("shusto_daily_sales") || "[]") as DailySale[]
  return dailySales.find((s) => s.date === getTodayDate()) || null
}

// Get provider earnings
export function getProviderEarnings(providerId: string): number {
  const transactions = JSON.parse(localStorage.getItem("shusto_revenue_transactions") || "[]")
  return transactions
    .filter((t: any) => t.providerId === providerId && t.status === "completed")
    .reduce((sum: number, t: any) => sum + t.providerShare, 0)
}

// Get Shusto total earnings
export function getShustoEarnings(): number {
  const transactions = JSON.parse(localStorage.getItem("shusto_revenue_transactions") || "[]")
  return transactions
    .filter((t: any) => t.status === "completed")
    .reduce((sum: number, t: any) => sum + t.shustoShare, 0)
}

// Get revenue split info for display
export function getRevenueSplitInfo() {
  return Object.entries(REVENUE_SHARING).map(([key, value]) => ({
    serviceName: key,
    shustoPercent: value.shustoShare * 100,
    providerPercent: value.providerShare * 100,
    affordability: value.affordability,
  }))
}
