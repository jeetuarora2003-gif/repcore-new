import Link from "next/link"
import { ChevronRight, Phone, Mail, MapPin, Clock, Send, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 98765 43210", "+91 98765 43211"],
    action: "tel:+919876543210",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["hello@aquafresh.in", "support@aquafresh.in"],
    action: "mailto:hello@aquafresh.in",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Fisherman's Wharf,", "Marine Drive, Mumbai 400002"],
    action: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 8:00 AM - 8:00 PM", "Sunday: 9:00 AM - 5:00 PM"],
    action: null,
  },
]

export const metadata = {
  title: "Contact Us | Aqua Fresh",
  description:
    "Get in touch with Aqua Fresh. We're here to help with your orders, queries, and feedback.",
}

export default function ContactPage() {
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
            <span className="text-foreground">Contact Us</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Get In Touch
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Have questions about our products or services? We&apos;re here to help.
            Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <h2 className="font-serif text-2xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="order">Order Inquiry</SelectItem>
                      <SelectItem value="product">Product Question</SelectItem>
                      <SelectItem value="delivery">Delivery Issue</SelectItem>
                      <SelectItem value="refund">Refund Request</SelectItem>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="partnership">Business Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help you..."
                  className="bg-secondary border-border focus:border-primary min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{info.title}</h3>
                  {info.details.map((detail, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {info.action ? (
                        <a
                          href={info.action}
                          className="hover:text-primary transition-colors"
                        >
                          {detail}
                        </a>
                      ) : (
                        detail
                      )}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.831632987567!2d72.8196443!3d18.9302376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1c73a0d5cad%3A0xc70a25a7209c733c!2sMarine%20Drive!5e0!3m2!1sen!2sin!4v1704812345678!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aqua Fresh Location"
              />
            </div>

            {/* Social Links */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium text-foreground mb-4">Follow Us</h3>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
