import Link from "next/link"
import { ChevronRight, CreditCard, Wallet, Building2, Banknote, Shield, Lock, HelpCircle, RefreshCw } from "lucide-react"

const paymentMethods = [
  {
    icon: Wallet,
    title: "UPI Payments",
    description: "Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app",
    logos: ["Google Pay", "PhonePe", "Paytm", "BHIM"],
  },
  {
    icon: CreditCard,
    title: "Credit & Debit Cards",
    description: "All major cards accepted with secure 3D authentication",
    logos: ["Visa", "Mastercard", "RuPay", "Amex"],
  },
  {
    icon: Building2,
    title: "Net Banking",
    description: "Direct payment from your bank account",
    logos: ["HDFC", "ICICI", "SBI", "Axis", "50+ Banks"],
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    description: "Pay when your order arrives at your doorstep",
    logos: ["Available up to ₹5,000"],
  },
]

const securityBadges = [
  {
    icon: Shield,
    title: "SSL Secured",
    description: "All transactions are encrypted with 256-bit SSL",
  },
  {
    icon: Lock,
    title: "PCI Compliant",
    description: "We meet all PCI DSS security standards",
  },
  {
    icon: RefreshCw,
    title: "Easy Refunds",
    description: "Quick refunds processed within 2-3 days",
  },
]

export const metadata = {
  title: "Payment Methods | Aqua Fresh",
  description: "Learn about the secure payment options available at Aqua Fresh - UPI, Cards, Net Banking, and Cash on Delivery.",
}

export default function PaymentMethodsPage() {
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
            <span className="text-foreground">Payment Methods</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Safe & Secure Payments
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            We offer multiple secure payment options for your convenience. All transactions are protected with industry-standard encryption.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.title}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{method.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {method.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {method.logos.map((logo) => (
                      <span
                        key={logo}
                        className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground"
                      >
                        {logo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold">
              Your Security is Our Priority
            </h2>
            <p className="text-muted-foreground mt-3">
              We use industry-leading security measures to protect your payment information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityBadges.map((badge) => (
              <div
                key={badge.title}
                className="bg-card rounded-xl border border-border p-6 text-center"
              >
                <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <badge.icon className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-semibold">{badge.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Policy Summary */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            Refund Policy
          </h2>
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you&apos;re not happy with the quality of our products:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Contact us within 24 hours of delivery with photos of the product</li>
              <li>We&apos;ll process a full refund or replacement immediately</li>
              <li>Refunds are credited within 2-3 business days</li>
              <li>Original payment method is used for refunds</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold">
              Have Questions About Payments?
            </h2>
            <p className="text-muted-foreground mt-3">
              Visit our FAQ section or contact our support team for help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <Link
                href="/faq"
                className="text-primary hover:underline font-medium"
              >
                View Payment FAQs
              </Link>
              <span className="hidden sm:inline text-border">|</span>
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
