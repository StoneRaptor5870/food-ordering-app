"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface Restaurant {
  id: number
  name: string
  description: string
  image: string
  rating: number
  address: string
  country: string
}

interface CartItem {
  item: MenuItem
  quantity: number
  restaurant: Restaurant
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: MenuItem, restaurant: Restaurant) => void
  removeFromCart: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getTotalItems: () => number
  getItemQuantity: (itemId: number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem, restaurant: Restaurant) => {
    setCartItems((prevItems) => {
      // Check if item from same restaurant exists
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.item.id === item.id && cartItem.restaurant.id === restaurant.id,
      )

      if (existingItemIndex > -1) {
        // Update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, { item, quantity: 1, restaurant }]
      }
    })
  }

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((cartItem) => cartItem.item.id === itemId)

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]
        if (updatedItems[existingItemIndex].quantity > 1) {
          updatedItems[existingItemIndex].quantity -= 1
          return updatedItems
        } else {
          return updatedItems.filter((_, index) => index !== existingItemIndex)
        }
      }
      return prevItems
    })
  }

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.item.id !== itemId))
    } else {
      setCartItems((prevItems) =>
        prevItems.map((cartItem) => (cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem)),
      )
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems.find((item) => item.item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        getTotalItems,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
