"use client"

import { useState, useEffect } from "react"
// import { useAuth } from "@/components/authProvider"
import { useCart } from "@/components/cartProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/useToast"
import { Star, MapPin, Plus, X, Minus } from "lucide-react"
import Image from "next/image"

interface Restaurant {
  id: number
  name: string
  description: string
  image: string
  rating: number
  address: string
  country: string
}

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface RestaurantMenuModalProps {
  restaurant: Restaurant
  isOpen: boolean
  onClose: () => void
}

export default function RestaurantMenuModal({ restaurant, isOpen, onClose }: RestaurantMenuModalProps) {
  // const { user } = useAuth()
  const { addToCart, getItemQuantity, removeFromCart } = useCart()
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && restaurant) {
      fetchMenu()
    }
  }, [isOpen, restaurant])

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/restaurants/${restaurant.id}/menu`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch menu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item, restaurant)
    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`,
    })
  }

  const handleRemoveFromCart = (item: MenuItem) => {
    removeFromCart(item.id)
    toast({
      title: "Removed from Cart",
      description: `${item.name} removed from your cart`,
    })
  }

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce(
    (groups, item) => {
      const category = item.category || "Other"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, MenuItem[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] h-[95vh] sm:h-[90vh] p-0 [&>button]:hidden">
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b flex-shrink-0 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-4 text-base">{restaurant.description}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{restaurant.rating}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{restaurant.address}</span>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {restaurant.country}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading menu...</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 sm:px-6">
              <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-600 border-b border-orange-100 pb-2">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {items.map((item) => {
                        const quantity = getItemQuantity(item.id)
                        return (
                          <Card
                            key={item.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow p-0 duration-200"
                          >
                            <div className="aspect-video w-full overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg?height=200&width=300"}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h4>
                                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                  <span className="font-bold text-xl text-orange-600">${item.price}</span>

                                  <div className="flex items-center space-x-2">
                                    {quantity > 0 ? (
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRemoveFromCart(item)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <Badge variant="secondary" className="px-3 py-1 font-semibold">
                                          {quantity}
                                        </Badge>
                                        <Button size="sm" onClick={() => handleAddToCart(item)} className="h-8 w-8 p-0">
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button size="sm" onClick={() => handleAddToCart(item)} className="px-4 py-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add to Cart
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
