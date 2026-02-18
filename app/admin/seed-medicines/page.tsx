"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SeedMedicinesPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const medicines = [
    // Pain Relief & Fever
    {
      name: "Napa",
      generic_name: "Paracetamol",
      company: "Beximco",
      strength: "500mg",
      form: "Tablet",
      price: 0.8,
      category: "pain-relief",
      prescription_required: false,
    },
    {
      name: "Napa Extend",
      generic_name: "Paracetamol",
      company: "Beximco",
      strength: "665mg",
      form: "Tablet",
      price: 2.5,
      category: "pain-relief",
      prescription_required: false,
    },
    {
      name: "Ace",
      generic_name: "Paracetamol",
      company: "Square",
      strength: "500mg",
      form: "Tablet",
      price: 0.7,
      category: "pain-relief",
      prescription_required: false,
    },
    {
      name: "Ace Plus",
      generic_name: "Paracetamol + Caffeine",
      company: "Square",
      strength: "500mg+65mg",
      form: "Tablet",
      price: 2.0,
      category: "pain-relief",
      prescription_required: false,
    },
    {
      name: "Flexi",
      generic_name: "Aceclofenac",
      company: "Square",
      strength: "100mg",
      form: "Tablet",
      price: 6.0,
      category: "pain-relief",
      prescription_required: true,
    },
    {
      name: "Maxpro",
      generic_name: "Ibuprofen",
      company: "Renata",
      strength: "400mg",
      form: "Tablet",
      price: 3.0,
      category: "pain-relief",
      prescription_required: false,
    },
    {
      name: "Napa Syrup",
      generic_name: "Paracetamol",
      company: "Beximco",
      strength: "120mg/5ml",
      form: "Syrup",
      price: 25.0,
      category: "pediatric",
      prescription_required: false,
    },

    // Antibiotics
    {
      name: "Monas",
      generic_name: "Amoxicillin",
      company: "Square",
      strength: "500mg",
      form: "Capsule",
      price: 8.0,
      category: "antibiotic",
      prescription_required: true,
    },
    {
      name: "Amoxi",
      generic_name: "Amoxicillin",
      company: "Beximco",
      strength: "250mg",
      form: "Capsule",
      price: 5.0,
      category: "antibiotic",
      prescription_required: true,
    },
    {
      name: "Azithromycin",
      generic_name: "Azithromycin",
      company: "Incepta",
      strength: "500mg",
      form: "Tablet",
      price: 15.0,
      category: "antibiotic",
      prescription_required: true,
    },
    {
      name: "Ciprofloxacin",
      generic_name: "Ciprofloxacin",
      company: "Square",
      strength: "500mg",
      form: "Tablet",
      price: 7.0,
      category: "antibiotic",
      prescription_required: true,
    },
    {
      name: "Cefixime",
      generic_name: "Cefixime",
      company: "Renata",
      strength: "200mg",
      form: "Capsule",
      price: 18.0,
      category: "antibiotic",
      prescription_required: true,
    },

    // Gastric & Digestive
    {
      name: "Seclo",
      generic_name: "Omeprazole",
      company: "Square",
      strength: "20mg",
      form: "Capsule",
      price: 4.0,
      category: "gastric",
      prescription_required: false,
    },
    {
      name: "Seclo MUPS",
      generic_name: "Omeprazole",
      company: "Square",
      strength: "20mg",
      form: "Tablet",
      price: 6.0,
      category: "gastric",
      prescription_required: false,
    },
    {
      name: "Pentoprazole",
      generic_name: "Pantoprazole",
      company: "Incepta",
      strength: "40mg",
      form: "Tablet",
      price: 5.0,
      category: "gastric",
      prescription_required: false,
    },
    {
      name: "Ranitidine",
      generic_name: "Ranitidine",
      company: "Beximco",
      strength: "150mg",
      form: "Tablet",
      price: 2.5,
      category: "gastric",
      prescription_required: false,
    },
    {
      name: "Esmolol",
      generic_name: "Esomeprazole",
      company: "Renata",
      strength: "20mg",
      form: "Capsule",
      price: 7.0,
      category: "gastric",
      prescription_required: false,
    },

    // Allergy & Cold
    {
      name: "Fexo",
      generic_name: "Fexofenadine",
      company: "Square",
      strength: "120mg",
      form: "Tablet",
      price: 8.0,
      category: "allergy",
      prescription_required: false,
    },
    {
      name: "Cetirizine",
      generic_name: "Cetirizine",
      company: "Incepta",
      strength: "10mg",
      form: "Tablet",
      price: 2.0,
      category: "allergy",
      prescription_required: false,
    },
    {
      name: "Alatrol",
      generic_name: "Loratadine",
      company: "Beximco",
      strength: "10mg",
      form: "Tablet",
      price: 3.0,
      category: "allergy",
      prescription_required: false,
    },
    {
      name: "Montair",
      generic_name: "Montelukast",
      company: "Square",
      strength: "10mg",
      form: "Tablet",
      price: 10.0,
      category: "allergy",
      prescription_required: true,
    },

    // Vitamins & Supplements
    {
      name: "Vitamin C",
      generic_name: "Ascorbic Acid",
      company: "Square",
      strength: "500mg",
      form: "Tablet",
      price: 2.0,
      category: "vitamin",
      prescription_required: false,
    },
    {
      name: "Calcium D",
      generic_name: "Calcium + Vitamin D3",
      company: "Renata",
      strength: "500mg+200IU",
      form: "Tablet",
      price: 5.0,
      category: "vitamin",
      prescription_required: false,
    },
    {
      name: "B-Complex",
      generic_name: "Vitamin B Complex",
      company: "Beximco",
      strength: "Mixed",
      form: "Tablet",
      price: 3.0,
      category: "vitamin",
      prescription_required: false,
    },
    {
      name: "Folic Acid",
      generic_name: "Folic Acid",
      company: "Square",
      strength: "5mg",
      form: "Tablet",
      price: 1.5,
      category: "womens-health",
      prescription_required: false,
    },

    // Diabetes
    {
      name: "Metformin",
      generic_name: "Metformin",
      company: "Square",
      strength: "500mg",
      form: "Tablet",
      price: 2.5,
      category: "diabetes",
      prescription_required: true,
    },
    {
      name: "Glimepiride",
      generic_name: "Glimepiride",
      company: "Incepta",
      strength: "2mg",
      form: "Tablet",
      price: 5.0,
      category: "diabetes",
      prescription_required: true,
    },
    {
      name: "Insulin Mixtard",
      generic_name: "Insulin",
      company: "Novo Nordisk",
      strength: "100IU/ml",
      form: "Injection",
      price: 450.0,
      category: "diabetes",
      prescription_required: true,
    },

    // Blood Pressure
    {
      name: "Amlodipine",
      generic_name: "Amlodipine",
      company: "Square",
      strength: "5mg",
      form: "Tablet",
      price: 3.0,
      category: "blood-pressure",
      prescription_required: true,
    },
    {
      name: "Losartan",
      generic_name: "Losartan",
      company: "Renata",
      strength: "50mg",
      form: "Tablet",
      price: 6.0,
      category: "blood-pressure",
      prescription_required: true,
    },
    {
      name: "Atenolol",
      generic_name: "Atenolol",
      company: "Beximco",
      strength: "50mg",
      form: "Tablet",
      price: 2.5,
      category: "blood-pressure",
      prescription_required: true,
    },

    // Respiratory
    {
      name: "Salbutamol",
      generic_name: "Salbutamol",
      company: "Square",
      strength: "4mg",
      form: "Tablet",
      price: 2.0,
      category: "respiratory",
      prescription_required: true,
    },
    {
      name: "Montelukast",
      generic_name: "Montelukast",
      company: "Incepta",
      strength: "10mg",
      form: "Tablet",
      price: 12.0,
      category: "respiratory",
      prescription_required: true,
    },
    {
      name: "Ambroxol",
      generic_name: "Ambroxol",
      company: "Renata",
      strength: "30mg",
      form: "Tablet",
      price: 3.0,
      category: "respiratory",
      prescription_required: false,
    },
  ]

  const seedDatabase = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const supabase = createClient()

      // Insert medicines in batches
      const { data, error: insertError } = await supabase.from("medicines").insert(medicines).select()

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        setError(`Error: ${insertError.message}`)
        return
      }

      setMessage(`Successfully added ${data?.length || medicines.length} medicines to the database!`)
    } catch (err: any) {
      console.error("[v0] Seed error:", err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Medicine Database Seeder</h1>
        <p className="text-muted-foreground mb-6">
          Click the button below to populate the database with {medicines.length} medicines.
        </p>

        <Button onClick={seedDatabase} disabled={loading} size="lg" className="w-full">
          {loading ? "Adding Medicines..." : "Seed Database"}
        </Button>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Medicines to be added:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pain Relief & Fever: Napa, Ace, Flexi, Maxpro</li>
            <li>Antibiotics: Monas, Amoxi, Azithromycin, Ciprofloxacin</li>
            <li>Gastric: Seclo, Pentoprazole, Ranitidine</li>
            <li>Allergy: Fexo, Cetirizine, Alatrol</li>
            <li>Vitamins: Vitamin C, Calcium D, B-Complex</li>
            <li>Diabetes: Metformin, Glimepiride, Insulin</li>
            <li>Blood Pressure: Amlodipine, Losartan, Atenolol</li>
            <li>Respiratory: Salbutamol, Montelukast, Ambroxol</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
