import { showPaymentNotification } from "./notifications"

export interface PaymentConfig {
  amount: number
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  productName: string
  paymentMethod: "sslcommerz" | "bkash" | "nagad"
}

/**
 * Initialize SSLCommerz payment
 */
export async function initializeSSLCommerzPayment(config: PaymentConfig): Promise<{
  success: boolean
  redirectUrl?: string
  error?: string
}> {
  try {
    const response = await fetch("/api/payment/sslcommerz/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: config.amount,
        provider: "sslcommerz",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Payment initialization failed" }
    }

    // Return the payment gateway URL
    return {
      success: true,
      redirectUrl: data.sslcommerz_url,
    }
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return { success: false, error: "Payment initialization failed" }
  }
}

/**
 * Show payment success notification
 */
export async function handlePaymentSuccess(amount: number, description: string = ""): Promise<void> {
  try {
    await showPaymentNotification(amount)
  } catch (error) {
    console.error("[v0] Error showing payment notification:", error)
  }
}

/**
 * Redirect to SSLCommerz payment with form post
 */
export function redirectToSSLCommerz(postParams: Record<string, any>, sslcommerzUrl: string): void {
  try {
    // Create a hidden form
    const form = document.createElement("form")
    form.method = "POST"
    form.action = sslcommerzUrl

    // Add all parameters as hidden inputs
    Object.keys(postParams).forEach((key) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = String(postParams[key])
      form.appendChild(input)
    })

    // Append to body and submit
    document.body.appendChild(form)
    form.submit()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(form)
    }, 100)
  } catch (error) {
    console.error("[v0] Error redirecting to SSLCommerz:", error)
    throw new Error("Payment redirection failed. Please try again.")
  }
}
