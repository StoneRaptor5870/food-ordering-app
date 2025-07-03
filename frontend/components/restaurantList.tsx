"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/authProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { Star, Eye, Search, Filter } from "lucide-react"
import RestaurantMenuModal from "@/components/restaurantsMenuModal"
import Image from "next/image"

export interface Restaurant {
  id: number
  name: string
  description: string
  image: string
  rating: number
  address: string
  country: string
}

export default function RestaurantList(/*{ canPlaceOrders }: { canPlaceOrders: boolean }*/) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("all")

  const filterCountries = user?.role === "admin"

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    filterRestaurants()
  }, [restaurants, searchTerm, countryFilter])

  const fetchRestaurants = async () => {
    try {
      const params = user?.role === "admin" ? "" : `?country=${user?.country}`
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/restaurants${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch restaurants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRestaurants = () => {
    let filtered = restaurants

    if (searchTerm) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((restaurant) => restaurant.country === countryFilter)
    }

    setFilteredRestaurants(filtered)
  }

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsMenuModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsMenuModalOpen(false)
    setSelectedRestaurant(null)
  }

  if (loading) {
    return <div className="text-center py-8">Loading restaurants...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Restaurants</h2>
        <div className="text-sm text-gray-600">
          {user?.role === "admin" ? "Viewing all restaurants" : `Viewing restaurants in ${user?.country}`}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {filterCountries && <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="india">🇮🇳 India</SelectItem>
                <SelectItem value="america">🇺🇸 America</SelectItem>
              </SelectContent>
            </Select>
          </div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-lg transition-shadow p-0 overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={restaurant.image || "/placeholder.svg?height=200&width=300"}
                alt={restaurant.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <CardHeader className="p-6">
              <CardTitle className="flex justify-between items-start">
                <span>{restaurant.name}</span>
                <Badge variant="secondary">{restaurant.country}</Badge>
              </CardTitle>
              <CardDescription>{restaurant.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{restaurant.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{restaurant.country}</span>
              </div>
              <Button onClick={() => handleRestaurantClick(restaurant)} className="w-full flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>View Menu & Order</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRestaurants.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No restaurants found</p>
          {searchTerm || countryFilter !== "all" ? (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setCountryFilter("all")
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No restaurants available in your area.</p>
          )}
        </div>
      )}

      {!loading && filteredRestaurants.length > 0 && (searchTerm || countryFilter !== "all") && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Showing {filteredRestaurants.length} of {restaurants.length} restaurants
            {searchTerm && (
              <span>
                {" "}
                for &quot;<span className="font-medium">{searchTerm}</span>&quot;
              </span>
            )}
            {countryFilter !== "all" && (
              <span>
                {" "}
                in <span className="font-medium">{countryFilter}</span>
              </span>
            )}
          </p>
        </div>
      )}

      {selectedRestaurant && (
        <RestaurantMenuModal restaurant={selectedRestaurant} isOpen={isMenuModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  )
}
