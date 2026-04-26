import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getCategoryBySlug, getProductsByCategory, categories } from "@/lib/data"
import { ShopFilters } from "@/components/shop/shop-filters"
import { ProductGrid } from "@/components/shop/product-grid"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryData = getCategoryBySlug(category)
  
  if (!categoryData) {
    return { title: "Category Not Found | Aqua Fresh" }
  }

  return {
    title: `${categoryData.name} | Aqua Fresh`,
    description: categoryData.description,
  }
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryData = getCategoryBySlug(category)

  if (!categoryData) {
    notFound()
  }

  const products = getProductsByCategory(category)

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-secondary border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={categoryData.image}
            alt={categoryData.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />
        
        <div className="relative container mx-auto px-4 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{categoryData.name}</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            {categoryData.name}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            {categoryData.description}
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
            {products.length > 0 ? (
              <Suspense fallback={<div className="text-muted-foreground">Loading products...</div>}>
                <ProductGrid products={products} />
              </Suspense>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found in this category.</p>
                <Link href="/shop" className="text-primary hover:underline mt-2 inline-block">
                  Browse all products
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Description for SEO */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            About Our {categoryData.name}
          </h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            {categoryData.description} All our {categoryData.name.toLowerCase()} are sourced 
            daily from trusted fishermen and delivered fresh to your doorstep. We ensure 
            the highest quality through rigorous quality checks and temperature-controlled 
            packaging.
          </p>
        </div>
      </section>
    </div>
  )
}
