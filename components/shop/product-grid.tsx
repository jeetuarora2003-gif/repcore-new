"use client"

import { useState } from "react"
import { ProductCard } from "@/components/products/product-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/lib/data"

interface ProductGridProps {
  products: Product[]
}

type SortOption = "newest" | "price-low" | "price-high" | "best-selling"

export function ProductGrid({ products }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "best-selling":
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">
          Showing <span className="text-foreground font-medium">{products.length}</span> products
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="best-selling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          disabled
        >
          Previous
        </button>
        <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
          1
        </button>
        <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors">
          2
        </button>
        <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors">
          3
        </button>
        <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Next
        </button>
      </div>
    </div>
  )
}
