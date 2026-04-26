"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const steps = [
  { id: "placed", label: "Order Placed", icon: Package },
  { id: "packed", label: "Packed", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivery", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
]

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [orderStatus, setOrderStatus] = useState<null | {
    id: string
    currentStep: number
    estimatedDelivery: string
    lastUpdate: string
    address: string
  }>(null)

  const handleTrack = () => {
    if (orderId) {
      // Simulate order tracking
      setOrderStatus({
        id: orderId.toUpperCase(),
        currentStep: 3, // Shipped
        estimatedDelivery: "Today, 5:00 PM - 8:00 PM",
        lastUpdate: "Your order has been shipped and is on its way",
        address: "123 Marine Drive, Mumbai 400002",
      })
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Track Order</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Track Your Order
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Enter your order ID to track the status of your delivery in real-time.
          </p>
        </div>
      </section>

      {/* Track Form */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter your Order ID (e.g., ORD-2024-001)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-primary py-6"
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
              </div>
              <Button
                onClick={handleTrack}
                className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 px-8"
              >
                Track Order
              </Button>
            </div>
          </div>

          {/* Order Status */}
          {orderStatus && (
            <div className="mt-8 space-y-8">
              {/* Order Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-semibold text-lg">{orderStatus.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-semibold text-lg text-primary">
                      {orderStatus.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-semibold text-lg mb-8">Order Status</h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border">
                    <div
                      className="absolute top-0 left-0 w-full bg-primary transition-all"
                      style={{
                        height: `${(orderStatus.currentStep / (steps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="space-y-8">
                    {steps.map((step, index) => {
                      const isCompleted = index < orderStatus.currentStep
                      const isCurrent = index === orderStatus.currentStep
                      const isPending = index > orderStatus.currentStep

                      return (
                        <div key={step.id} className="relative flex items-start gap-4 pl-2">
                          {/* Icon */}
                          <div
                            className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted || isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground border border-border"
                            }`}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1.5">
                            <p
                              className={`font-medium ${
                                isCompleted || isCurrent
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-primary mt-1">
                                {orderStatus.lastUpdate}
                              </p>
                            )}
                            {isCompleted && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Completed
                              </p>
                            )}
                          </div>

                          {/* Time indicator for current */}
                          {isCurrent && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Address
                </h3>
                <p className="text-muted-foreground">{orderStatus.address}</p>
              </div>

              {/* Need Help */}
              <div className="bg-secondary rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Need Help?</p>
                    <p className="text-sm text-muted-foreground">
                      Contact our support team
                    </p>
                  </div>
                </div>
                <Link href="/contact">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
