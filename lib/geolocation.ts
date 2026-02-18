// Calculate distance between two coordinates using Haversine formula (in km)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get user's current location
export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

// Parse address and convert to approximate coordinates (simple implementation)
// In production, use Google Maps API for proper geocoding
export const parseCoordinates = (address: string): { lat: number; lon: number } | null => {
  // This is a fallback - should use actual geocoding service
  // For now, return Dhaka center as default
  if (!address) {
    return { lat: 23.8103, lon: 90.4125 } // Dhaka, Bangladesh
  }
  return { lat: 23.8103, lon: 90.4125 } // Dhaka center
}

interface Provider {
  id: string
  address?: string
  lat?: number
  lon?: number
  [key: string]: any
}

// Find nearest provider based on user location
export const findNearestProvider = (
  providers: Provider[],
  userLat: number,
  userLon: number
): Provider | null => {
  if (!providers || providers.length === 0) return null

  let nearest: Provider | null = null
  let minDistance = Infinity

  providers.forEach((provider) => {
    // Get provider coordinates
    let providerLat = provider.lat
    let providerLon = provider.lon

    // If coordinates not available, try to parse from address
    if (!providerLat || !providerLon) {
      const parsed = parseCoordinates(provider.address)
      if (parsed) {
        providerLat = parsed.lat
        providerLon = parsed.lon
      }
    }

    if (providerLat && providerLon) {
      const distance = calculateDistance(userLat, userLon, providerLat, providerLon)
      if (distance < minDistance) {
        minDistance = distance
        nearest = { ...provider, distance }
      }
    }
  })

  return nearest
}

// Find multiple nearest providers sorted by distance
export const findNearestProviders = (
  providers: Provider[],
  userLat: number,
  userLon: number,
  limit: number = 5
): Provider[] => {
  if (!providers || providers.length === 0) return []

  const withDistance = providers
    .map((provider) => {
      let providerLat = provider.lat
      let providerLon = provider.lon

      if (!providerLat || !providerLon) {
        const parsed = parseCoordinates(provider.address)
        if (parsed) {
          providerLat = parsed.lat
          providerLon = parsed.lon
        }
      }

      if (providerLat && providerLon) {
        const distance = calculateDistance(userLat, userLon, providerLat, providerLon)
        return { ...provider, distance }
      }

      return { ...provider, distance: Infinity }
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)

  return withDistance
}
