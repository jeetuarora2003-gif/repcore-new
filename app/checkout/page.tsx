"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, CreditCard, Building2, Wallet, Banknote, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"

const deliverySlots = [
  { id: "morning", label: "Morning (9 AM - 12 PM)" },
  { id: "afternoon", label: "Afternoon (12 PM - 3 PM)" },
  { id: "evening", label: "Evening (5 PM - 8 PM)" },
]

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Wallet, description: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Building2, description: "All major banks" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, description: "Pay when delivered" },
]

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const [deliverySlot, setDeliverySlot] = useState("morning")
  const [paymentMethod, setPaymentMethod] = useState("upi")

  const deliveryFee = totalPrice > 999 ? 0 : 49
  const finalTotal = totalPrice + deliveryFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <h1 className="font-serif text-2xl font-bold mb-3">No Items to Checkout</h1>
            <p className="text-muted-foreground mb-8">
              Your cart is empty. Add some items to proceed with checkout.
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Checkout</h1>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Details */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-lg mb-6">Billing & Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="House/Flat no., Building name, Street"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="Enter pincode"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    placeholder="Near..."
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Slot */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-lg mb-6">Select Delivery Slot</h2>
              <RadioGroup
                value={deliverySlot}
                onValueChange={setDeliverySlot}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {deliverySlots.map((slot) => (
                  <label
                    key={slot.id}
                    htmlFor={slot.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      deliverySlot === slot.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={slot.id} id={slot.id} />
                    <span className="text-sm">{slot.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Special Instructions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-lg mb-4">Special Instructions (Optional)</h2>
              <Textarea
                placeholder="Any special requests for your order? E.g., specific cutting style, delivery instructions..."
                className="bg-secondary border-border focus:border-primary min-h-[100px]"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-lg mb-6">Payment Method</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    htmlFor={`payment-${method.id}`}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <method.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.weight}`}
                    className="flex gap-3"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.weight}</p>
                      <p className="text-sm text-foreground mt-1">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">
                    {deliveryFee === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base mt-6">
                <Lock className="h-4 w-4 mr-2" />
                Place Order
              </Button>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />
                <span>SSL Secured | 256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
