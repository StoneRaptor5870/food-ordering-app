"use client"

import Image from 'next/image'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/authProvider"
import { useCart } from "@/components/cartProvider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, X, Store } from "lucide-react"
import { Restaurant } from './restaurantList'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { user } = useAuth()
  const { cartItems, updateQuantity, clearCart, getTotalAmount, getTotalItems } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [checkingOut, setCheckingOut] = useState(false)

  // Group cart items by restaurant
  const groupedItems = cartItems.reduce(
    (groups, cartItem) => {
      const restaurantId = cartItem.restaurant.id
      if (!groups[restaurantId]) {
        groups[restaurantId] = {
          restaurant: cartItem.restaurant,
          items: [],
        }
      }
      groups[restaurantId].items.push(cartItem)
      return groups
    },
    {} as Record<number, { restaurant: Restaurant; items: typeof cartItems }>,
  )

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: number) => {
    updateQuantity(itemId, 0)
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place orders",
        variant: "destructive",
      })
      onClose()
      router.push("/login")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      })
      return
    }

    const canPlaceOrders = user.role === "admin" || user.role === "manager"

    if (!canPlaceOrders) {
      toast({
        title: "Permission Denied",
        description: "Only managers and admins can place orders",
        variant: "destructive",
      })
      return
    }

    setCheckingOut(true)

    try {
      // Process orders for each restaurant separately
      const orderPromises = Object.values(groupedItems).map(async ({ restaurant, items }) => {
        const orderData = {
          restaurantId: restaurant.id,
          items: items.map((cartItem) => ({
            menuItemId: cartItem.item.id,
            quantity: cartItem.quantity,
          })),
          deliveryAddress: "123 Main St",
        }

        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(orderData),
        })

        if (orderResponse.ok) {
          const order = await orderResponse.json()

          // Process payment
          const checkoutResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/checkout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })

          if (!checkoutResponse.ok) {
            throw new Error(`Payment failed for ${restaurant.name}`)
          }

          return { restaurant: restaurant.name, success: true }
        } else {
          throw new Error(`Order creation failed for ${restaurant.name}`)
        }
      })

      await Promise.all(orderPromises)

      toast({
        title: "Orders Successful!",
        description: `All your orders have been placed and paid successfully!`,
      })

      clearCart()
      onClose()

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "There was an error processing your orders.",
        variant: "destructive",
      })
    } finally {
      setCheckingOut(false)
    }
  }

  const handleCreateOrders = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to create orders",
        variant: "destructive",
      })
      onClose()
      router.push("/login")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before creating orders",
        variant: "destructive",
      })
      return
    }

    try {
      // Create orders for each restaurant separately
      const orderPromises = Object.values(groupedItems).map(async ({ restaurant, items }) => {
        const orderData = {
          restaurantId: restaurant.id,
          items: items.map((cartItem) => ({
            menuItemId: cartItem.item.id,
            quantity: cartItem.quantity,
          })),
          deliveryAddress: "123 Main St",
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(orderData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create order for ${restaurant.name}`)
        }

        return restaurant.name
      })

      await Promise.all(orderPromises)

      toast({
        title: "Orders Created!",
        description: "Your orders have been created successfully. A manager will process the payments.",
      })

      clearCart()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create orders.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 [&>button]:hidden">
        <div className="p-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">Your Cart</h2>
              {getTotalItems() > 0 && <Badge variant="secondary">{getTotalItems()} items</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 py-4">
                {Object.values(groupedItems).map(({ restaurant, items }) => (
                  <div key={restaurant.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Store className="h-4 w-4 text-orange-600" />
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {restaurant.country}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {items.map((cartItem) => (
                        <div key={cartItem.item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                          <Image
                            src={cartItem.item.image || "/placeholder.svg?height=40&width=40"}
                            alt={cartItem.item.name}
                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{cartItem.item.name}</h4>
                            <p className="text-xs text-gray-600 truncate">{cartItem.item.description}</p>
                            <p className="text-xs font-semibold text-orange-600">${cartItem.item.price}</p>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{cartItem.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(cartItem.item.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right flex-shrink-0 min-w-0">
                            <span className="font-semibold text-sm">
                              ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 pt-4 border-t flex-shrink-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-orange-600">${getTotalAmount().toFixed(2)}</span>
              </div>

              <div className="flex space-x-3">
                <Button onClick={clearCart} variant="outline" className="flex-1 bg-transparent">
                  Clear Cart
                </Button>

                {user && (user.role === "admin" || user.role === "manager") ? (
                  <Button onClick={handleCheckout} className="flex-1" disabled={checkingOut}>
                    {checkingOut ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Checkout & Pay
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleCreateOrders} className="flex-1">
                    Create Orders
                  </Button>
                )}
              </div>

              {(!user || user.role === "member") && (
                <p className="text-xs text-gray-500 text-center">
                  {user ? "Only managers and admins can checkout and pay" : "Login required to place orders"}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
