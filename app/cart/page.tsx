"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/products/product-card"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const deliveryFee = totalPrice > 999 ? 0 : 49
  const finalTotal = totalPrice + deliveryFee

  const recommendedProducts = products.slice(0, 4)

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="h-24 w-24 rounded-full bg-card border border-border mx-auto flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-3">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added any items yet. Start shopping our fresh seafood collection!
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Shopping
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
            <span className="text-foreground">Shopping Cart</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {items.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {item.category}
                          </p>
                          <h3 className="font-medium text-foreground mt-1 line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.weight}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.weight)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center bg-secondary rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.weight, item.quantity - 1)
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.weight, item.quantity + 1)
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-semibold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors mt-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground">Have a coupon?</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter code"
                    className="bg-secondary border-border focus:border-primary"
                  />
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 flex-shrink-0">
                    Apply
                  </Button>
                </div>
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
                {totalPrice < 999 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(999 - totalPrice).toLocaleString("en-IN")} more for free delivery
                  </p>
                )}
                <div className="flex items-center justify-between text-lg font-semibold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block mt-6">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base">
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Security Badge */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout powered by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
