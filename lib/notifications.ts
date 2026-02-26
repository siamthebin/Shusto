/**
 * Notification System with Sound Alerts
 * Used for booking confirmations, order notifications, etc.
 */

export type NotificationType = "booking" | "order" | "payment" | "message" | "alert"

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  type?: NotificationType
  playSound?: boolean
  vibrate?: boolean | number[]
}

/**
 * Play notification sound with fallback options
 */
export function playNotificationSound(volume: number = 0.8): void {
  try {
    // Create audio context for playing sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create oscillator for alarm sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Set alarm frequency and pattern
    oscillator.frequency.value = 800 // 800 Hz

    // Set volume
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    // Play sound
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Second tone
    setTimeout(() => {
      try {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()

        osc2.connect(gain2)
        gain2.connect(audioContext.destination)

        osc2.frequency.value = 1000 // 1000 Hz
        gain2.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.5)
      } catch (e) {
        // Silent failure
      }
    }, 300)
  } catch (error) {
    console.error("[v0] Error playing notification sound:", error)
    // Fallback: try to use HTML5 audio
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==")
      audio.volume = 0.5
      audio.play().catch(() => {
        // Silent failure
      })
    } catch (e) {
      // Final fallback - use Vibration API
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }
}

/**
 * Show browser notification with sound
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  const { title, body, icon, badge, tag, type = "alert", playSound = true, vibrate = true } = options

  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("[v0] Notifications not supported by browser")
      return
    }

    // Request permission if needed
    if (Notification.permission === "denied") {
      console.warn("[v0] Notification permission denied")
      return
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        console.warn("[v0] Notification permission not granted")
        return
      }
    }

    // Create and show notification
    const notification = new Notification(title, {
      body,
      icon: icon || "/icon-192.png",
      badge: badge || "/icon-192.png",
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: true,
    })

    // Play sound
    if (playSound) {
      playNotificationSound()
    }

    // Vibrate
    if (vibrate && "vibrate" in navigator) {
      if (typeof vibrate === "boolean") {
        navigator.vibrate([200, 100, 200, 100, 200])
      } else {
        navigator.vibrate(vibrate)
      }
    }

    // Close notification after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  } catch (error) {
    console.error("[v0] Error showing notification:", error)
  }
}

/**
 * Show booking confirmation notification
 */
export async function showBookingNotification(doctorName: string, appointmentTime: string): Promise<void> {
  await showNotification({
    title: "বুকিং নিশ্চিত করা হয়েছে",
    body: `ডা. ${doctorName} এর সাথে ${appointmentTime} এ অ্যাপয়েন্টমেন্ট`,
    icon: "/icon-192.png",
    tag: "booking",
    type: "booking",
    playSound: true,
    vibrate: [200, 100, 200],
  })
}

/**
 * Show order confirmation notification for providers
 */
export async function showOrderNotification(patientName: string, orderType: string): Promise<void> {
  await showNotification({
    title: "নতুন অর্ডার পাওয়া গেছে",
    body: `${patientName} থেকে ${orderType} অর্ডার`,
    icon: "/icon-192.png",
    tag: "order",
    type: "order",
    playSound: true,
    vibrate: [300, 150, 300],
  })
}

/**
 * Show payment confirmation notification
 */
export async function showPaymentNotification(amount: number): Promise<void> {
  await showNotification({
    title: "পেমেন্ট সফল",
    body: `৳${amount.toLocaleString()} পেমেন্ট সফলভাবে সম্পন্ন হয়েছে`,
    icon: "/icon-192.png",
    tag: "payment",
    type: "payment",
    playSound: true,
    vibrate: [100, 100, 100],
  })
}
