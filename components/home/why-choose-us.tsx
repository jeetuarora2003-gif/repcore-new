import { Shield, Clock, Recycle } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Quality Guarantee",
    description:
      "Every product undergoes rigorous quality checks. We guarantee 100% freshness or your money back. No questions asked.",
  },
  {
    icon: Clock,
    title: "Same Day Processing",
    description:
      "Orders placed before 10 AM are processed and dispatched the same day. Your seafood is never more than a day from the ocean.",
  },
  {
    icon: Recycle,
    title: "Eco Friendly Packaging",
    description:
      "We use sustainable, recyclable packaging materials that keep your seafood fresh while protecting our oceans.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Our Promise
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-balance">
            Why Choose Aqua Fresh
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            We go above and beyond to ensure you receive the finest seafood experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
            >
              {/* Number indicator */}
              <span className="absolute top-6 right-6 font-serif text-6xl font-bold text-border/30 group-hover:text-primary/10 transition-colors">
                {(index + 1).toString().padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
