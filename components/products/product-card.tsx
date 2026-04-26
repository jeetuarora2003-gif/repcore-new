"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const defaultWeight = product.weightOptions[1] || product.weightOptions[0]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: defaultWeight.price,
      weight: defaultWeight.weight,
      image: product.image,
      category: product.category,
    })
  }

  return (
    <Link
      href={`/shop/product/${product.slug}`}
      className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden card-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                product.badge === "Live"
                  ? "bg-success text-success-foreground"
                  : product.badge === "Best Seller"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border border-border"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="font-medium text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Weight Options */}
        <p className="text-xs text-muted-foreground mt-2">
          {product.weightOptions.map((w) => w.weight).join(" / ")}
        </p>

        {/* Price */}
        <div className="mt-auto pt-3">
          <p className="font-semibold text-lg text-foreground">
            <span className="text-sm">₹</span>
            {defaultWeight.price.toLocaleString("en-IN")}
            <span className="text-sm text-muted-foreground font-normal">
              /{defaultWeight.weight}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}
