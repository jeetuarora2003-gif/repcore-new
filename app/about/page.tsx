import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Fish, Leaf, Award, Users, MapPin, Package, Truck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const values = [
  {
    icon: Fish,
    title: "Freshness First",
    description:
      "Every product is sourced daily and delivered within 24-48 hours of catch. We never compromise on freshness.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We partner only with sustainable fisheries and farms, protecting our oceans for future generations.",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description:
      "Rigorous quality checks at every step ensure you receive only the finest seafood, every single time.",
  },
]

const stats = [
  { number: "10+", label: "Years in Business" },
  { number: "50K+", label: "Happy Customers" },
  { number: "100+", label: "Fish Varieties" },
  { number: "50+", label: "Cities Delivered" },
]

const team = [
  {
    name: "Rajesh Menon",
    role: "Founder & CEO",
    image: "/images/team/team-1.jpg",
  },
  {
    name: "Priya Sharma",
    role: "Head of Operations",
    image: "/images/team/team-2.jpg",
  },
  {
    name: "Arjun Nair",
    role: "Quality Manager",
    image: "/images/team/team-3.jpg",
  },
  {
    name: "Meera Patel",
    role: "Customer Success",
    image: "/images/team/team-4.jpg",
  },
]

export const metadata = {
  title: "About Us | Aqua Fresh",
  description:
    "Learn about Aqua Fresh&apos;s journey, our mission to deliver the freshest seafood, and our commitment to sustainability.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative bg-secondary border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/about-hero.jpg"
            alt="Fresh seafood"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />

        <div className="relative container mx-auto px-4 lg:px-8 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">About Us</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
              Our Story
            </h1>
            <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
              From a small fishing community to India&apos;s trusted seafood brand,
              discover how Aqua Fresh is bringing the ocean&apos;s finest to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Our Journey
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">
                From Ocean to Table, With Love
              </h2>
              <div className="space-y-4 mt-6 text-muted-foreground leading-relaxed">
                <p>
                  Aqua Fresh was born from a simple belief: everyone deserves access to
                  truly fresh, high-quality seafood. Founded in 2014 by Rajesh Menon, a
                  third-generation fisherman from Kerala, we started with a mission to
                  bridge the gap between coastal communities and urban households.
                </p>
                <p>
                  What began as a small operation supplying local restaurants has grown
                  into India&apos;s most trusted online seafood marketplace. Today, we
                  partner with over 500 fishermen across coastal India, ensuring fair
                  prices for our fishing communities while delivering unmatched freshness
                  to our customers.
                </p>
                <p>
                  Our state-of-the-art processing facilities, cold chain logistics, and
                  commitment to sustainability have made us the choice of over 50,000
                  families and 200+ restaurants across 50 cities.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/about-story.jpg"
                alt="Fishermen at work"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Our Values
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-2xl border border-border p-8 text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-4xl md:text-5xl font-bold text-primary">
                  {stat.number}
                </p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Our Team
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">
              Meet the People Behind Aqua Fresh
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-card rounded-2xl border border-border overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Experience the Aqua Fresh Difference
            </h2>
            <p className="text-muted-foreground mt-4">
              Join thousands of satisfied customers who trust us for their seafood needs.
            </p>
            <Link href="/shop" className="inline-block mt-8">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
