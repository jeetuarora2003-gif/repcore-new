"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Search, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from "@/lib/data"

const categories = [
  "Orders & Delivery",
  "Products & Quality",
  "Payment & Refunds",
  "Account & Registration",
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Orders & Delivery")

  const filteredFAQs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs.filter((faq) => faq.category === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">FAQs</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Find answers to common questions about orders, delivery, products, and more.
          </p>

          {/* Search */}
          <div className="max-w-xl mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary py-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Tabs */}
          {!searchQuery && (
            <div className="lg:col-span-1">
              <nav className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      activeCategory === category
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* FAQ List */}
          <div className={searchQuery ? "lg:col-span-4" : "lg:col-span-3"}>
            {searchQuery && (
              <p className="text-muted-foreground mb-6">
                {filteredFAQs.length} results for &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/50"
                  >
                    <AccordionTrigger className="text-left font-medium hover:text-primary py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mt-4">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <Link href="/contact" className="inline-block mt-6">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
