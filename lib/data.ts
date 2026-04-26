export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  categorySlug: string
  price: number
  weightOptions: { weight: string; price: number }[]
  image: string
  images: string[]
  rating: number
  reviewCount: number
  freshness: "Live" | "Fresh" | "Frozen"
  badge?: string
  inStock: boolean
  caughtDate: string
  sourceLocation: string
  processingMethod: string
  shelfLife: string
  nutritionalInfo: {
    calories: string
    protein: string
    fat: string
    omega3: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: {
    name: string
    avatar: string
  }
  date: string
  readTime: string
  tags: string[]
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  avatar: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

// Categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Prawns",
    slug: "prawns",
    description:
      "Succulent prawns sourced from pristine waters, perfect for curries, grills, and stir-fries.",
    image: "/images/prawns.jpg",
    productCount: 8,
  },
  {
    id: "2",
    name: "Salmon",
    slug: "salmon",
    description:
      "Premium Atlantic and Norwegian salmon, rich in omega-3 and perfect for any cuisine.",
    image: "/images/salmon.jpg",
    productCount: 5,
  },
  {
    id: "3",
    name: "Tuna",
    slug: "tuna",
    description:
      "Fresh yellowfin and bluefin tuna steaks, ideal for sashimi, steaks, and gourmet dishes.",
    image: "/images/tuna.jpg",
    productCount: 4,
  },
  {
    id: "4",
    name: "Crabs",
    slug: "crabs",
    description:
      "Live and fresh crabs including blue swimmer, mud crabs, and king crabs.",
    image: "/images/crab.jpg",
    productCount: 6,
  },
  {
    id: "5",
    name: "Freshwater Fish",
    slug: "freshwater-fish",
    description:
      "Traditional freshwater favorites including rohu, catla, and tilapia.",
    image: "/images/salmon.jpg",
    productCount: 7,
  },
]

// Products
export const products: Product[] = [
  {
    id: "1",
    name: "Fresh Atlantic Salmon",
    slug: "fresh-atlantic-salmon",
    description:
      "Our premium Atlantic Salmon is sourced from the cold, pristine waters of Norway. Each fillet is carefully selected for its rich, buttery texture and vibrant coral color. Perfect for grilling, baking, or enjoying raw as sashimi. Our salmon is sustainably farmed and fed a natural diet, resulting in superior taste and nutrition.",
    shortDescription:
      "Premium Norwegian salmon with rich, buttery texture. Perfect for grilling or sashimi.",
    category: "Salmon",
    categorySlug: "salmon",
    price: 850,
    weightOptions: [
      { weight: "250g", price: 450 },
      { weight: "500g", price: 850 },
      { weight: "1kg", price: 1600 },
    ],
    image: "/images/salmon.jpg",
    images: [
      "/images/salmon.jpg",
      "/images/salmon.jpg",
      "/images/salmon.jpg",
    ],
    rating: 4.8,
    reviewCount: 124,
    freshness: "Fresh",
    badge: "Best Seller",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Norwegian Fjords",
    processingMethod: "Hand-filleted, skin-on",
    shelfLife: "3-5 days refrigerated",
    nutritionalInfo: {
      calories: "208 kcal/100g",
      protein: "20g/100g",
      fat: "13g/100g",
      omega3: "2.3g/100g",
    },
  },
  {
    id: "2",
    name: "Tiger Prawns (Large)",
    slug: "tiger-prawns-large",
    description:
      "Jumbo tiger prawns caught fresh from the Bay of Bengal. These magnificent prawns are known for their sweet, succulent meat and firm texture. Perfect for tandoori preparations, butter garlic prawns, or classic prawn curry. Each prawn is carefully cleaned and deveined for your convenience.",
    shortDescription:
      "Jumbo tiger prawns with sweet, succulent meat. Ideal for curries and grills.",
    category: "Prawns",
    categorySlug: "prawns",
    price: 650,
    weightOptions: [
      { weight: "250g", price: 350 },
      { weight: "500g", price: 650 },
      { weight: "1kg", price: 1200 },
    ],
    image: "/images/prawns.jpg",
    images: [
      "/images/prawns.jpg",
      "/images/prawns.jpg",
      "/images/prawns.jpg",
    ],
    rating: 4.9,
    reviewCount: 256,
    freshness: "Fresh",
    badge: "Popular",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Bay of Bengal",
    processingMethod: "Cleaned & Deveined",
    shelfLife: "2-3 days refrigerated",
    nutritionalInfo: {
      calories: "99 kcal/100g",
      protein: "24g/100g",
      fat: "0.3g/100g",
      omega3: "0.5g/100g",
    },
  },
  {
    id: "3",
    name: "Yellowfin Tuna Steak",
    slug: "yellowfin-tuna-steak",
    description:
      "Premium yellowfin tuna steaks, perfect for searing or enjoying as sashimi-grade cuts. Our tuna is line-caught to ensure the highest quality and sustainability. The deep red flesh indicates freshness and is prized for its mild, meaty flavor with a firm texture.",
    shortDescription:
      "Sashimi-grade tuna steaks with firm texture and mild, meaty flavor.",
    category: "Tuna",
    categorySlug: "tuna",
    price: 720,
    weightOptions: [
      { weight: "250g", price: 380 },
      { weight: "500g", price: 720 },
      { weight: "1kg", price: 1350 },
    ],
    image: "/images/tuna.jpg",
    images: [
      "/images/tuna.jpg",
      "/images/tuna.jpg",
      "/images/tuna.jpg",
    ],
    rating: 4.7,
    reviewCount: 89,
    freshness: "Fresh",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Indian Ocean",
    processingMethod: "Hand-cut steaks",
    shelfLife: "2-3 days refrigerated",
    nutritionalInfo: {
      calories: "144 kcal/100g",
      protein: "23g/100g",
      fat: "5g/100g",
      omega3: "1.3g/100g",
    },
  },
  {
    id: "4",
    name: "Blue Swimmer Crabs",
    slug: "blue-swimmer-crabs",
    description:
      "Live blue swimmer crabs, known for their sweet, delicate meat. These crabs are caught daily from coastal waters and delivered live to ensure maximum freshness. Perfect for crab curries, chilli crab, or steamed with garlic butter.",
    shortDescription:
      "Live blue swimmer crabs with sweet, delicate meat. Perfect for crab curry.",
    category: "Crabs",
    categorySlug: "crabs",
    price: 480,
    weightOptions: [
      { weight: "500g (2-3 pcs)", price: 480 },
      { weight: "1kg (4-6 pcs)", price: 900 },
    ],
    image: "/images/crab.jpg",
    images: [
      "/images/crab.jpg",
      "/images/crab.jpg",
      "/images/crab.jpg",
    ],
    rating: 4.6,
    reviewCount: 67,
    freshness: "Live",
    badge: "Live",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Coastal Waters",
    processingMethod: "Live delivery",
    shelfLife: "Cook within 24 hours",
    nutritionalInfo: {
      calories: "87 kcal/100g",
      protein: "18g/100g",
      fat: "1g/100g",
      omega3: "0.4g/100g",
    },
  },
  {
    id: "5",
    name: "Rohu Fish (Whole)",
    slug: "rohu-fish-whole",
    description:
      "Fresh whole rohu fish, a beloved staple in Indian households. Our rohu is sourced from clean, well-maintained farms and is known for its mild, sweet flavor and firm texture. Perfect for traditional Bengali fish curry, fried fish, or fish fry.",
    shortDescription:
      "Traditional whole rohu fish, perfect for Bengali fish curry.",
    category: "Freshwater Fish",
    categorySlug: "freshwater-fish",
    price: 320,
    weightOptions: [
      { weight: "500g", price: 180 },
      { weight: "1kg", price: 320 },
      { weight: "2kg", price: 600 },
    ],
    image: "/images/salmon.jpg",
    images: [
      "/images/salmon.jpg",
      "/images/salmon.jpg",
      "/images/salmon.jpg",
    ],
    rating: 4.5,
    reviewCount: 312,
    freshness: "Fresh",
    badge: "Value Pick",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Local Farms",
    processingMethod: "Whole, cleaned on request",
    shelfLife: "2-3 days refrigerated",
    nutritionalInfo: {
      calories: "97 kcal/100g",
      protein: "17g/100g",
      fat: "2g/100g",
      omega3: "0.3g/100g",
    },
  },
  {
    id: "6",
    name: "King Prawns (Premium)",
    slug: "king-prawns-premium",
    description:
      "Extra-large king prawns with exceptional flavor and meaty texture. These premium prawns are perfect for special occasions and gourmet preparations.",
    shortDescription:
      "Extra-large premium king prawns for gourmet preparations.",
    category: "Prawns",
    categorySlug: "prawns",
    price: 950,
    weightOptions: [
      { weight: "250g", price: 500 },
      { weight: "500g", price: 950 },
      { weight: "1kg", price: 1800 },
    ],
    image: "/images/prawns.jpg",
    images: ["/images/prawns.jpg"],
    rating: 4.9,
    reviewCount: 78,
    freshness: "Fresh",
    badge: "Premium",
    inStock: true,
    caughtDate: "Daily Fresh",
    sourceLocation: "Arabian Sea",
    processingMethod: "Head-on, shell-on",
    shelfLife: "2-3 days refrigerated",
    nutritionalInfo: {
      calories: "106 kcal/100g",
      protein: "25g/100g",
      fat: "0.5g/100g",
      omega3: "0.6g/100g",
    },
  },
]

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    comment:
      "The freshest seafood I've ever ordered online! The salmon was so fresh it felt like I was at the coast. Delivery was prompt and packaging was excellent.",
    avatar: "/images/avatars/avatar-1.jpg",
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    location: "Delhi",
    rating: 5,
    comment:
      "As a restaurant owner, quality matters most to me. Aqua Fresh has been our trusted supplier for 2 years. Their prawns are consistently excellent!",
    avatar: "/images/avatars/avatar-2.jpg",
  },
  {
    id: "3",
    name: "Anita Desai",
    location: "Bangalore",
    rating: 5,
    comment:
      "Finally found a reliable source for fresh fish in Bangalore! The rohu was so fresh, just like what we get back home in Kolkata. Highly recommend!",
    avatar: "/images/avatars/avatar-3.jpg",
  },
]

// Blog Posts
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Health Benefits of Eating Salmon Regularly",
    slug: "health-benefits-of-salmon",
    excerpt:
      "Discover why salmon is considered a superfood and how incorporating it into your diet can boost your heart health, brain function, and overall wellbeing.",
    content: `
      <p>Salmon is one of the most nutritious foods on the planet. This fatty fish is loaded with nutrients that may reduce risk factors for several diseases.</p>
      
      <h2>1. Rich in Omega-3 Fatty Acids</h2>
      <p>Salmon is one of the best sources of long-chain omega-3 fatty acids EPA and DHA. A 100-gram portion of farmed salmon has 2.3 grams of long-chain omega-3 fatty acids.</p>
      
      <h2>2. Great Source of Protein</h2>
      <p>Salmon is rich in high-quality protein, which is important for maintaining muscle mass, bone health, and aiding recovery after injury.</p>
      
      <h2>3. High in B Vitamins</h2>
      <p>Salmon is an excellent source of several B vitamins, which help your body produce energy, control inflammation, and protect heart and brain health.</p>
    `,
    image: "/images/blog/salmon-health.jpg",
    category: "Health",
    author: {
      name: "Dr. Meera Patel",
      avatar: "/images/avatars/author-1.jpg",
    },
    date: "2024-01-15",
    readTime: "5 min read",
    tags: ["health", "salmon", "nutrition", "omega-3"],
  },
  {
    id: "2",
    title: "The Perfect Butter Garlic Prawns Recipe",
    slug: "butter-garlic-prawns-recipe",
    excerpt:
      "Learn how to make restaurant-style butter garlic prawns at home with this simple yet delicious recipe that's perfect for any occasion.",
    content: `
      <p>Butter garlic prawns are a classic dish that's surprisingly easy to make at home. Here's our foolproof recipe.</p>
      
      <h2>Ingredients</h2>
      <ul>
        <li>500g tiger prawns, cleaned and deveined</li>
        <li>4 tablespoons butter</li>
        <li>8 cloves garlic, minced</li>
        <li>Fresh parsley, chopped</li>
        <li>Salt and pepper to taste</li>
        <li>Juice of 1 lemon</li>
      </ul>
      
      <h2>Instructions</h2>
      <p>Heat butter in a pan over medium heat. Add garlic and sauté until fragrant. Add prawns and cook for 2-3 minutes each side until pink...</p>
    `,
    image: "/images/blog/prawns-recipe.jpg",
    category: "Recipes",
    author: {
      name: "Chef Vikram Singh",
      avatar: "/images/avatars/author-2.jpg",
    },
    date: "2024-01-10",
    readTime: "8 min read",
    tags: ["recipe", "prawns", "seafood", "cooking"],
  },
  {
    id: "3",
    title: "Sustainable Fishing: Why It Matters",
    slug: "sustainable-fishing-matters",
    excerpt:
      "Understanding the importance of sustainable fishing practices and how your seafood choices can help protect our oceans for future generations.",
    content: `
      <p>Sustainable fishing is crucial for maintaining healthy ocean ecosystems and ensuring seafood availability for future generations.</p>
      
      <h2>What is Sustainable Fishing?</h2>
      <p>Sustainable fishing means leaving enough fish in the ocean, respecting habitats, and ensuring people who depend on fishing can maintain their livelihoods.</p>
      
      <h2>Our Commitment</h2>
      <p>At Aqua Fresh, we partner only with fishermen and farms that follow sustainable practices...</p>
    `,
    image: "/images/blog/sustainable-fishing.jpg",
    category: "Sustainability",
    author: {
      name: "Arjun Nair",
      avatar: "/images/avatars/author-3.jpg",
    },
    date: "2024-01-05",
    readTime: "6 min read",
    tags: ["sustainability", "ocean", "fishing", "environment"],
  },
]

// FAQs
export const faqs: FAQ[] = [
  // Orders & Delivery
  {
    id: "1",
    question: "How long does delivery take?",
    answer:
      "We offer same-day delivery for orders placed before 10 AM in select cities. For other locations, delivery typically takes 1-2 business days. All our products are shipped in temperature-controlled packaging to ensure freshness.",
    category: "Orders & Delivery",
  },
  {
    id: "2",
    question: "What are the delivery charges?",
    answer:
      "Delivery is free for orders above ₹999. For orders below this amount, a flat delivery fee of ₹49 applies. Express delivery options are available at additional cost.",
    category: "Orders & Delivery",
  },
  {
    id: "3",
    question: "Can I track my order?",
    answer:
      "Yes! Once your order is dispatched, you'll receive a tracking link via SMS and email. You can also track your order from the 'My Orders' section in your account.",
    category: "Orders & Delivery",
  },
  {
    id: "4",
    question: "What if I'm not home during delivery?",
    answer:
      "Our delivery partners will attempt to contact you before delivery. If you're unavailable, you can reschedule the delivery or have it delivered to an alternate address.",
    category: "Orders & Delivery",
  },
  {
    id: "5",
    question: "Do you deliver to my location?",
    answer:
      "We currently deliver across all major cities in India. Enter your pincode on our website to check if we deliver to your area.",
    category: "Orders & Delivery",
  },
  // Products & Quality
  {
    id: "6",
    question: "How fresh is your seafood?",
    answer:
      "All our seafood is sourced daily and delivered within 24-48 hours of catch. We maintain strict cold chain logistics to ensure your seafood arrives in perfect condition.",
    category: "Products & Quality",
  },
  {
    id: "7",
    question: "Are your products cleaned and ready to cook?",
    answer:
      "Yes, most of our products come cleaned and ready to cook. For whole fish, you can choose your preferred cut (steaks, fillets, or whole) during checkout.",
    category: "Products & Quality",
  },
  {
    id: "8",
    question: "How should I store the seafood after delivery?",
    answer:
      "Fresh seafood should be refrigerated immediately and consumed within 2-3 days. For longer storage, you can freeze the products for up to 3 months.",
    category: "Products & Quality",
  },
  {
    id: "9",
    question: "Do you source sustainably?",
    answer:
      "Absolutely! We partner with certified sustainable fisheries and farms. We're committed to protecting marine ecosystems while delivering the finest seafood.",
    category: "Products & Quality",
  },
  {
    id: "10",
    question: "What's the difference between Fresh and Frozen?",
    answer:
      "Fresh products are never frozen and delivered within 24-48 hours of catch. Frozen products are flash-frozen at sea to lock in freshness and have a longer shelf life.",
    category: "Products & Quality",
  },
  // Payment & Refunds
  {
    id: "11",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including UPI, Credit/Debit cards, Net Banking, and Cash on Delivery. All online payments are secured with 256-bit encryption.",
    category: "Payment & Refunds",
  },
  {
    id: "12",
    question: "Is Cash on Delivery available?",
    answer:
      "Yes, COD is available for orders up to ₹5,000 in select cities. A small handling fee may apply.",
    category: "Payment & Refunds",
  },
  {
    id: "13",
    question: "What's your refund policy?",
    answer:
      "If you're not satisfied with the quality of our products, we offer a 100% refund or replacement. Simply contact us within 24 hours of delivery with photos of the product.",
    category: "Payment & Refunds",
  },
  {
    id: "14",
    question: "How long do refunds take?",
    answer:
      "Refunds are processed within 2-3 business days of approval. The amount will be credited to your original payment method within 5-7 business days.",
    category: "Payment & Refunds",
  },
  {
    id: "15",
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled before they are dispatched. Once dispatched, cancellation is not possible but you can refuse delivery for a full refund.",
    category: "Payment & Refunds",
  },
  // Account & Registration
  {
    id: "16",
    question: "Do I need an account to order?",
    answer:
      "While you can checkout as a guest, creating an account lets you track orders, save addresses, and earn loyalty points on every purchase.",
    category: "Account & Registration",
  },
  {
    id: "17",
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' on the login page. Enter your registered email address and we'll send you a password reset link.",
    category: "Account & Registration",
  },
  {
    id: "18",
    question: "How can I update my delivery address?",
    answer:
      "You can add or edit your delivery addresses from the 'Addresses' section in your account dashboard.",
    category: "Account & Registration",
  },
]

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getFAQsByCategory(category: string): FAQ[] {
  return faqs.filter((f) => f.category === category)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
  )
}
