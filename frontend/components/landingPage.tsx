"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/authProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, ShoppingCart, Utensils, Globe } from "lucide-react"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">FoodieHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
                  <Button onClick={() => router.push("/dashboard")} variant="default">
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => router.push("/login")} variant="outline">
                    Login
                  </Button>
                  <Button onClick={() => router.push("/signup")} variant="default">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Delicious Food
            <span className="text-orange-600"> Delivered</span>
            <br />
            Right to Your Door
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing restaurants, order your favorite meals, and enjoy fast delivery. From local favorites to
            international cuisine, we`&apos;`ve got it all!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-3">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 bg-transparent"
            >
              <Globe className="mr-2 h-5 w-5" />
              Browse Restaurants
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FoodieHub?</h2>
            <p className="text-lg text-gray-600">
              Experience the best food delivery service with these amazing features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your food delivered in 30 minutes or less. We partner with the fastest delivery services in your
                  area.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Different access levels for admins, managers, and members. Perfect for businesses and organizations.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Global Cuisine</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Discover restaurants from India, America, and around the world. Authentic flavors from every corner of
                  the globe.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Order?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of satisfied customers and start ordering today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button
                onClick={() => router.push("/signup")}
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Create Account
              </Button>
            )}
            <Button
              onClick={handleGetStarted}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-orange-600 bg-transparent"
            >
              {user ? "Go to Dashboard" : "Login Now"}
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="h-6 w-6 text-orange-600" />
                <h3 className="text-xl font-bold">FoodieHub</h3>
              </div>
              <p className="text-gray-400">
                Your favorite food delivery service, bringing delicious meals right to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white">
                    Restaurants
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/login")} className="hover:text-white">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/signup")} className="hover:text-white">
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Countries</h4>
              <ul className="space-y-2 text-gray-400">
                <li>🇮🇳 India</li>
                <li>🇺🇸 America</li>
                <li>More coming soon...</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FoodieHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}