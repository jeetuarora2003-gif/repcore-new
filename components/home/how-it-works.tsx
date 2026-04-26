import { MousePointerClick, Package, Truck } from "lucide-react"

const steps = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "Choose Your Fish",
    description:
      "Browse our selection of premium seafood and add your favorites to cart. Filter by type, freshness, or price.",
  },
  {
    icon: Package,
    step: "02",
    title: "We Pack Fresh",
    description:
      "Your order is carefully cleaned, portioned, and packed in temperature-controlled packaging for maximum freshness.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Delivered to You",
    description:
      "Our logistics partners ensure your seafood arrives at your doorstep fresh and ready to cook.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Simple Process
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-balance">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Getting fresh seafood delivered to your home has never been easier.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  {/* Step badge */}
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
