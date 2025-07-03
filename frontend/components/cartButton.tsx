"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cartProvider"
import CartModal from "@/components/cartModal"

export default function CartButton() {
  const { getTotalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const totalItems = getTotalItems()

  if (totalItems === 0) {
    return null // Don't show cart button if empty
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsCartOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow relative"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Button>
      </div>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
