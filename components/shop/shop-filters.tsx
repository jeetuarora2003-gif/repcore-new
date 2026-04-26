"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Category } from "@/lib/data"

interface ShopFiltersProps {
  categories: Category[]
}

const priceRanges = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹1500", min: 1000, max: 1500 },
  { label: "Above ₹1500", min: 1500, max: Infinity },
]

const freshnessOptions = ["Live", "Fresh", "Frozen"]

export function ShopFilters({ categories }: ShopFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedFreshness, setSelectedFreshness] = useState<string[]>([])

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const togglePrice = (label: string) => {
    setSelectedPrices((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    )
  }

  const toggleFreshness = (option: string) => {
    setSelectedFreshness((prev) =>
      prev.includes(option) ? prev.filter((f) => f !== option) : [...prev, option]
    )
  }

  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <label
                htmlFor={`cat-${category.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex-1"
              >
                {category.name}
              </label>
              <span className="text-xs text-muted-foreground">
                ({category.productCount})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          Price Range
        </h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <div key={range.label} className="flex items-center gap-3">
              <Checkbox
                id={`price-${range.label}`}
                checked={selectedPrices.includes(range.label)}
                onCheckedChange={() => togglePrice(range.label)}
              />
              <label
                htmlFor={`price-${range.label}`}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Freshness */}
      <div>
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          Freshness
        </h3>
        <div className="space-y-3">
          {freshnessOptions.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <Checkbox
                id={`freshness-${option}`}
                checked={selectedFreshness.includes(option)}
                onCheckedChange={() => toggleFreshness(option)}
              />
              <label
                htmlFor={`freshness-${option}`}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 ||
        selectedPrices.length > 0 ||
        selectedFreshness.length > 0) && (
        <Button
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/10"
          onClick={() => {
            setSelectedCategories([])
            setSelectedPrices([])
            setSelectedFreshness([])
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </h2>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full border-border">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-card">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
