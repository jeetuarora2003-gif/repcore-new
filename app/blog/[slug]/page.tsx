import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, Calendar, Share2, Facebook, Twitter, Linkedin, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBlogPostBySlug, blogPosts } from "@/lib/data"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return { title: "Post Not Found | Aqua Fresh" }
  }

  return {
    title: `${post.title} | Aqua Fresh Blog`,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null
  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative">
        <div className="relative aspect-[21/9] max-h-[500px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative -mt-32">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="hover:text-primary transition-colors">
                Blog
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </nav>

            {/* Category */}
            <span className="inline-block bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium text-foreground">{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Article Content */}
          <article
            className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="flex items-center justify-between mt-8 p-6 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share2 className="h-5 w-5" />
              <span>Share this article</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-8 p-6 bg-card rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Written by</p>
                <p className="font-semibold text-lg">{post.author.name}</p>
                <p className="text-muted-foreground mt-2">
                  A passionate food enthusiast and seafood expert, sharing knowledge about
                  healthy eating and sustainable fishing practices.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {prevPost.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="flex items-center justify-end gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors group text-right"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Next</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {nextPost.title}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8 text-center">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="group bg-card rounded-xl border border-border overflow-hidden card-hover"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="text-primary">{relatedPost.category}</span>
                    <span>•</span>
                    <span>{relatedPost.readTime}</span>
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
