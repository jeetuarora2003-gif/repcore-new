import Image from "next/image"
import { Instagram } from "lucide-react"

const galleryImages = [
  { id: 1, src: "/images/gallery/gallery-1.jpg", alt: "Fresh salmon fillet" },
  { id: 2, src: "/images/gallery/gallery-2.jpg", alt: "Tiger prawns" },
  { id: 3, src: "/images/gallery/gallery-3.jpg", alt: "Grilled fish" },
  { id: 4, src: "/images/gallery/gallery-4.jpg", alt: "Seafood platter" },
  { id: 5, src: "/images/gallery/gallery-5.jpg", alt: "Fresh crabs" },
  { id: 6, src: "/images/gallery/gallery-6.jpg", alt: "Tuna steak" },
]

export function InstagramGallery() {
  return (
    <section className="py-20 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            @aquafresh.in
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 text-balance">
            Follow Us on Instagram
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Get inspired by our fresh catches, recipes, and behind-the-scenes moments.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {galleryImages.map((image) => (
            <a
              key={image.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="h-8 w-8 text-primary" />
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Instagram className="h-5 w-5" />
            Follow @aquafresh.in
          </a>
        </div>
      </div>
    </section>
  )
}
