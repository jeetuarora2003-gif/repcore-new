import Link from "next/link"
import {
  ChevronRight,
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Clock,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  { href: "/account", label: "Dashboard", icon: User, active: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Account Details", icon: Settings },
]

const recentOrders = [
  {
    id: "ORD-2024-001",
    date: "Jan 15, 2024",
    status: "Delivered",
    total: 1850,
    items: 3,
  },
  {
    id: "ORD-2024-002",
    date: "Jan 12, 2024",
    status: "Processing",
    total: 720,
    items: 2,
  },
]

export default function AccountPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">My Account</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">My Account</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-card rounded-xl border border-border overflow-hidden">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    link.active
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-2">
                Welcome back, Rahul!
              </h2>
              <p className="text-muted-foreground">
                From your account dashboard you can view your recent orders, manage your
                shipping addresses, and edit your password and account details.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">In Transit</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹15,420</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg">Recent Orders</h3>
                <Link
                  href="/account/orders"
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.date} • {order.items} items
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-success/10 text-success"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm font-medium mt-1">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/track-order"
                className="bg-card rounded-xl border border-border p-6 flex items-center gap-4 hover:border-primary transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Track Order</p>
                  <p className="text-sm text-muted-foreground">
                    Check your order status
                  </p>
                </div>
              </Link>
              <Link
                href="/shop"
                className="bg-card rounded-xl border border-border p-6 flex items-center gap-4 hover:border-primary transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Continue Shopping</p>
                  <p className="text-sm text-muted-foreground">
                    Browse our fresh collection
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
