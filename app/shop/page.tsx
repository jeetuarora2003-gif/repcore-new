import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { products, categories } from "@/lib/data"
import { ShopFilters } from "@/components/shop/shop-filters"
import { ProductGrid } from "@/components/shop/product-grid"

export const metadata = {
  title: "Shop Fresh Seafood | Aqua Fresh",
  description: "Browse our premium selection of fresh fish, prawns, crabs, salmon, tuna and more. Same day delivery available.",
}

export default function ShopPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Banner */}
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Shop</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Fresh Collection
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Explore our carefully curated selection of premium seafood, sourced daily from trusted fishermen.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ShopFilters categories={categories} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <Suspense fallback={<div className="text-muted-foreground">Loading products...</div>}>
              <ProductGrid products={products} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
