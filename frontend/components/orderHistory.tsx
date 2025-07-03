"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { Calendar, MapPin, User } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "member"
  country: "india" | "america"
  paymentMethod?: string
}

interface OrderHistoryProps {
  user: User
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  menuItem: {
    name: string
    image: string
  }
}

interface Order {
  id: number
  totalAmount: number
  status: string
  deliveryAddress: string
  createdAt: string
  items: OrderItem[]
  user: {
    name: string
    country: string
  }
}

export default function OrderHistory({ user }: OrderHistoryProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId: number) => {
    if (!user || user.role === "member") {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to cancel orders",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order cancelled successfully",
        })
        fetchOrders()
      } else {
        throw new Error("Failed to cancel order")
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "preparing":
        return "secondary"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">No orders found</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Order #{order.id}</span>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>
                          {order.user?.name} ({order.user?.country})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${order.totalAmount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={item.menuItem.image || "/placeholder.svg?height=40&width=40"}
                              alt={item.menuItem.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <span className="font-medium">{item.menuItem.name}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-medium">${(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>Delivery Address: {order.deliveryAddress}</span>
                    </div>

                    {(user?.role === "admin" || user?.role === "manager") && order.status === "pending" && (
                      <Button onClick={() => cancelOrder(order.id)} variant="destructive" size="sm">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
