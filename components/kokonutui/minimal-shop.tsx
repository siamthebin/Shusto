"use client"

import { useState } from "react"
import { ProductGrid } from "./product-grid"
import { CartDrawer } from "./cart-drawer"
import { ProductModal } from "./product-modal"
import { PartnersSection } from "./partners-section"
import { HeroSection } from "./hero-section"
import { type Product, type CartItem, products } from "./data"
import BalanceHeader from "./balance-header"
import BottomNav from "./bottom-nav"

export default function MinimalShop() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("সব")

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "সব" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <BalanceHeader
        cartItemCount={cart.length}
        onCartClick={() => setIsCartOpen(true)}
        onProductSelect={setSelectedProduct}
      />

      <HeroSection />

      <div className="mx-auto px-2 pt-12 pb-16">
        <ProductGrid products={filteredProducts} onProductSelect={setSelectedProduct} />
      </div>

      <PartnersSection />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product) => {
            addToCart(product)
            setSelectedProduct(null)
            setIsCartOpen(true)
          }}
        />
      )}

      {isCartOpen && <CartDrawer cart={cart} onClose={() => setIsCartOpen(false)} onRemoveFromCart={removeFromCart} />}

      <BottomNav />
    </div>
  )
}
