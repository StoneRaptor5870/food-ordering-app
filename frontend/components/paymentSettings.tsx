"use client"

import { useState } from "react"
import { useAuth } from "@/components/authProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { CreditCard } from "lucide-react"

export default function PaymentSettings() {
  const { user, updatePaymentMethod } = useAuth()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState(user?.paymentMethod || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updatePaymentMethod(paymentMethod)
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Method</span>
          </CardTitle>
          <CardDescription>Update your default payment method for orders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Credit Card **** 1234"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Payment Method"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
