import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Search, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { blogPosts } from "@/lib/data"

const categories = ["All", "Health", "Recipes", "Sustainability", "Tips"]

export const metadata = {
  title: "Blog | Aqua Fresh",
  description:
    "Discover seafood recipes, health tips, and sustainability insights from the Aqua Fresh team.",
}

export default function BlogPage() {
  const featuredPost = blogPosts[0]
  const otherPosts = blogPosts.slice(1)

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
            <span className="text-foreground">Blog</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Fresh From Our Kitchen
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Recipes, tips, and insights to help you make the most of your seafood.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Featured Post */}
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block bg-card rounded-2xl border border-border overflow-hidden card-hover"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="text-primary">{featuredPost.category}</span>
                  <span>•</span>
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mt-3 line-clamp-2">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{featuredPost.author.name}</span>
                </div>
              </div>
            </Link>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden card-hover"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="text-primary">{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {post.author.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
                1
              </button>
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors">
                2
              </button>
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Next
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10 bg-secondary border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="block w-full text-left px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["health", "salmon", "recipes", "sustainability", "prawns", "cooking", "nutrition", "omega-3"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
