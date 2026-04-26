import { Fish, Package, Truck, Leaf } from "lucide-react"

const trustItems = [
  {
    icon: Fish,
    title: "Caught Fresh Daily",
    description: "Sourced from trusted local fishermen",
  },
  {
    icon: Package,
    title: "Hygienic Packaging",
    description: "Temperature-controlled delivery",
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    description: "Fast shipping to 50+ cities",
  },
  {
    icon: Leaf,
    title: "100% Natural",
    description: "No preservatives or chemicals",
  },
]

export function TrustBar() {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-sm md:text-base">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
