"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/authProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RestaurantList from "@/components/restaurantList"
import OrderHistory from "@/components/orderHistory"
import PaymentSettings from "@/components/paymentSettings"
import { LogOut, User } from "lucide-react"

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // const canPlaceOrders = user.role === "admin" || user.role === "manager"
  const canUpdatePayment = user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Food Ordering App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>
                  {user.name} ({user.role} - {user.country})
                </span>
              </div>
              <Button onClick={logout} variant="destructive" size="sm" className="flex items-center space-x-1">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="restaurants" className="w-full">
            <TabsList className={`grid w-full ${canUpdatePayment ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              {canUpdatePayment && <TabsTrigger value="payments">Payment Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="restaurants" className="mt-6">
              <RestaurantList /*canPlaceOrders={canPlaceOrders}*/ />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderHistory user={user}/>
            </TabsContent>

            {canUpdatePayment && (
              <TabsContent value="payments" className="mt-6">
                <PaymentSettings />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
