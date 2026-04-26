"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/products/product-card"

export function BestSellers() {
  const bestSellers = products.slice(0, 4)

  return (
    <section className="py-20 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Popular Choices
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-balance">
              Best Sellers
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Our most loved products, hand-picked by thousands of satisfied customers.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
