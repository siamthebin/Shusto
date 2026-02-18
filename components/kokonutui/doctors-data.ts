export interface Doctor {
  id: string
  name: string
  specialty: string
  qualification: string
  experience: string
  rating: number
  consultationFee: number
  availability: string[]
  image: string
  languages: string[]
  about: string
}

export const doctors: Doctor[] = []
