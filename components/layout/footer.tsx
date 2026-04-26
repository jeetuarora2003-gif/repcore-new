import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const quickLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQs" },
  { href: "/track-order", label: "Track Order" },
]

const categories = [
  { href: "/shop/prawns", label: "Prawns" },
  { href: "/shop/salmon", label: "Salmon" },
  { href: "/shop/tuna", label: "Tuna" },
  { href: "/shop/crabs", label: "Crabs" },
  { href: "/shop/freshwater-fish", label: "Freshwater Fish" },
]

const policies = [
  { href: "/payment-methods", label: "Payment Methods" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
]

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-muted-foreground mb-6">
              Get exclusive offers, new arrivals, and seafood tips delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-card border-border focus:border-primary"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative h-12 w-36 rounded-lg overflow-hidden">
                <Image
                  src="/images/logo.jpeg"
                  alt="Aqua Fresh Seafood Market"
                  width={140}
                  height={52}
                  className="h-full w-full object-contain mix-blend-lighten brightness-110 contrast-110"
                />
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Delivering the freshest seafood from ocean to your doorstep. Premium quality fish, prawns, crabs, and more across India.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  123 Fisherman&apos;s Wharf,<br />
                  Marine Drive, Mumbai 400002
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:hello@aquafresh.in"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  hello@aquafresh.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Aqua Fresh. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {policies.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Payment Icons */}
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs">We Accept:</span>
              <div className="flex items-center gap-2">
                <div className="bg-card px-2 py-1 rounded text-xs text-muted-foreground">UPI</div>
                <div className="bg-card px-2 py-1 rounded text-xs text-muted-foreground">Visa</div>
                <div className="bg-card px-2 py-1 rounded text-xs text-muted-foreground">MC</div>
                <div className="bg-card px-2 py-1 rounded text-xs text-muted-foreground">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
