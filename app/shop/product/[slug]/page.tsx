"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Calendar,
  Leaf,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductBySlug, products } from "@/lib/data"
import { useCart } from "@/lib/cart-context"
import { ProductCard } from "@/components/products/product-card"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [selectedWeight, setSelectedWeight] = useState(
    product.weightOptions[1] || product.weightOptions[0]
  )
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: selectedWeight.price,
      weight: selectedWeight.weight,
      image: product.image,
      category: product.category,
    })
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/shop/${product.categorySlug}`}
              className="hover:text-primary transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                      product.badge === "Live"
                        ? "bg-success text-success-foreground"
                        : product.badge === "Best Seller"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                    product.freshness === "Live"
                      ? "bg-success/20 text-success"
                      : product.freshness === "Fresh"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {product.freshness}
                </span>
              </div>
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-primary font-medium uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-foreground">
                <span className="text-lg">₹</span>
                {selectedWeight.price.toLocaleString("en-IN")}
                <span className="text-lg text-muted-foreground font-normal ml-2">
                  / {selectedWeight.weight}
                </span>
              </p>
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Weight Selector */}
            <div className="mt-8">
              <label className="text-sm font-medium text-foreground">
                Select Weight
              </label>
              <div className="flex flex-wrap gap-3 mt-3">
                {product.weightOptions.map((option) => (
                  <button
                    key={option.weight}
                    onClick={() => setSelectedWeight(option)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedWeight.weight === option.weight
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {option.weight} - ₹{option.price.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6">
              <label className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center bg-card border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:border-primary hover:bg-primary/10 py-6"
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist
              </Button>
            </div>

            {/* Product Highlights */}
            <div className="mt-8 p-4 bg-card rounded-xl border border-border">
              <h3 className="font-medium text-foreground mb-4">Product Highlights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Caught:</span>
                  <span className="text-foreground">{product.caughtDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="text-foreground">{product.sourceLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Processing:</span>
                  <span className="text-foreground">{product.processingMethod}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Shelf Life:</span>
                  <span className="text-foreground">{product.shelfLife}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                Free delivery above ₹999
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                100% Fresh Guarantee
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <RotateCcw className="h-4 w-4 text-primary" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start bg-card border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger
              value="description"
              className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Nutritional Info
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Delivery Info
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Reviews ({product.reviewCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="nutrition" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-bold text-primary">
                  {product.nutritionalInfo.calories}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Calories</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-bold text-primary">
                  {product.nutritionalInfo.protein}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Protein</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-bold text-primary">
                  {product.nutritionalInfo.fat}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Fat</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-bold text-primary">
                  {product.nutritionalInfo.omega3}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Omega-3</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="delivery" className="mt-6">
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Same Day Delivery:</strong> Orders
                placed before 10 AM are delivered the same day in select cities.
              </p>
              <p>
                <strong className="text-foreground">Standard Delivery:</strong> 1-2
                business days for most locations across India.
              </p>
              <p>
                <strong className="text-foreground">Packaging:</strong> All products are
                packed in temperature-controlled, food-safe packaging to maintain
                freshness.
              </p>
              <p>
                <strong className="text-foreground">Free Shipping:</strong> Orders above
                ₹999 qualify for free delivery.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <p className="text-muted-foreground">
              Customer reviews coming soon. Be the first to review this product!
            </p>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
