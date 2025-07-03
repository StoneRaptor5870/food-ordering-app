import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/authProvider"
import { CartProvider } from "@/components/cartProvider"
import { Toaster } from "@/components/ui/toaster"
import CartButton from "@/components/cartButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Food Ordering App",
  description: "Order food from your favorite restaurants",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartButton />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
