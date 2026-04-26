import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { categories } from "@/lib/data"

export function FeaturedCategories() {
  const featuredCategories = categories.slice(0, 4)

  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Our Selection
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-balance">
            Browse by Category
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our carefully curated selection of premium seafood, 
            sourced from the finest waters around the world.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border card-hover"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.productCount} Products
                </p>
                <div className="flex items-center gap-2 mt-3 text-primary text-sm font-medium">
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/50 transition-colors pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
