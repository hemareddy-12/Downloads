// Initial configurations and clean schema for hemareddy
// NOTE: All demo products and demo model photos have been completely removed.

export const initialBrandSettings = {
  brandName: 'hemareddy',
  tagline: '', // No hardcoded demo quote or tagline
  logoUrl: '/uploads/brand_logo.png', // User uploaded brand logo
  profilePhotoUrl: '', // Will use user's uploaded brand/profile photo
  description: '',
  watermarkSettings: {
    enabled: true,
    opacity: 0.05,
    size: 480,
    position: 'center', // 'center' | 'top-right' | 'bottom-right' | 'repeat'
    fixed: true,
  },
  socialLinks: {
    instagram: 'https://instagram.com/hemareddy',
    instagramHandle: '@hemareddy',
    facebook: '',
    youtube: '',
    other: '',
    whatsapp: '+91 98765 43210',
    whatsappNumber: '919876543210',
    phone: '+91 98765 43210',
    email: 'contact@hemareddy.com',
    address: 'Studio hemareddy, Hyderabad, India',
    businessHours: 'Mon - Sat: 10:30 AM - 8:00 PM',
  },
};

export const initialAboutSettings = {
  heading: 'About Me',
  subheading: 'Where Heritage Weaves Meet Precision Haute Couture',
  photoUrl: '', // Zero demo photos! Uploaded by owner from Admin > About
  quotation: '', // Zero hardcoded quotes! Fully editable by owner in Admin > About
  introduction: 'Welcome to hemareddy. Every creation, cut, and seam is personally designed and supervised to celebrate timeless craftsmanship and modern grace.',
  story: 'What started at my personal stitching desk with hand-guided scissors and vintage looms quickly blossomed into hemareddy. Every stitch is placed with intention, ensuring each saree, lehenga, and gown feels like a second skin.',
  passion: 'From selecting pure mulberry silks to hand-drawn embroidery patterns and exacting measurement cuts, my craft is anchored in celebrating the timeless grace of South Asian couture.',
  promise: 'Established with one uncompromising promise: no two women are the same, and your ceremonial garments should reflect your distinct grandeur.',
};

export const initialContactSettings = {
  whatsapp: '+91 98765 43210',
  whatsappNumber: '919876543210',
  phone: '+91 98765 43210',
  email: 'contact@hemareddy.com',
  instagram: 'https://instagram.com/hemareddy',
  instagramHandle: '@hemareddy',
  address: 'Studio hemareddy, Hyderabad, India',
  contactText: 'Whether you have an inquiry regarding ready-to-ship silks, bespoke bridal stitching, or a custom design, we are delighted to assist you.',
  businessHours: 'Mon - Sat: 10:30 AM - 8:00 PM',
};

export const initialWebsiteSettings = {
  homepage: {
    heroHeading: 'Handcrafted Couture & Bespoke Stitching',
    heroSubtitle: '', // Customizable from admin
    heroImageUrl: '', // User can upload their own hero banner
    heroButtonText: 'Explore Collections',
    heroButtonLink: '/shop',
    heroSecondaryButtonText: 'My Creations',
    heroSecondaryButtonLink: '/creations',
    categorySectionTitle: 'Curated Categories',
    categoryDescriptions: {
      sarees: 'Handwoven Silks & Heirloom Drapes',
      'half-sarees': 'Traditional Langa Vonis & Festive Ensembles',
      dresses: 'Designer Gowns, Anarkalis & Modern Silhouettes',
    },
    featuredSectionTitle: 'Featured Designs',
    newArrivalsSectionTitle: 'New Arrivals',
  },
  contact: initialContactSettings,
  social: {
    instagram: 'https://instagram.com/hemareddy',
    instagramHandle: '@hemareddy',
    facebook: '',
    youtube: '',
    other: '',
  },
  navigation: {
    menuNames: {
      home: 'Home',
      shop: 'Shop All',
      sarees: 'Sarees',
      halfSarees: 'Half Sarees',
      dresses: 'Dresses',
      creations: 'My Creations',
      stitching: 'Stitching',
      about: 'About',
      contact: 'Contact',
    },
    visibleItems: {
      home: true,
      shop: true,
      sarees: true,
      halfSarees: true,
      dresses: true,
      creations: true,
      stitching: true,
      about: true,
      contact: true,
    },
    footerText: 'Bespoke Haute Couture Atelier & Stitching by hemareddy.',
    footerCopyright: 'hemareddy. All rights reserved.',
  },
  appearance: {
    primaryColor: '#C8A97E', // Luxury antique gold accent
    secondaryColor: '#B5644D', // Warm rose/terracotta accent
    backgroundColor: '#FAF8F5', // Warm ivory background
    textColor: '#1E1C1A', // Deep charcoal text
    headerBgColor: '#FAF8F5',
  },
};

export const initialCategories = [
  {
    id: 'sarees',
    name: 'Sarees',
    slug: 'sarees',
    description: 'Handwoven Silks & Heirloom Drapes',
    image: '',
    featured: true,
  },
  {
    id: 'half-sarees',
    name: 'Half Sarees',
    slug: 'half-sarees',
    description: 'Traditional Langa Vonis & Festive Ensembles',
    image: '',
    featured: true,
  },
  {
    id: 'dresses',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Designer Gowns, Anarkalis & Modern Silhouettes',
    image: '',
    featured: true,
  },
];

// ZERO demo products. The website starts completely clean for the owner to add real inventory.
export const initialProducts = [];

// Default stitching services structure - ZERO demo model images.
// Owner uploads real stitching photos via Admin > Stitching.
export const initialStitchingServices = [
  {
    id: 'stitching-blouse',
    title: 'Custom Blouse Stitching',
    description: 'Perfect-fit designer blouse stitching with optional padding, custom necklines (sweetheart, boat neck, deep back), and piping.',
    price: 'Starting from ₹1,200',
    turnaround: '4-7 business days',
    image: '',
    images: [],
  },
  {
    id: 'stitching-maggam',
    title: 'Maggam & Aari Work Embroidery',
    description: 'Authentic hand-embroidered zardozi, kundan, thread work, and moti work tailored to complement your saree motifs.',
    price: 'Starting from ₹3,500',
    turnaround: '7-14 business days',
    image: '',
    images: [],
  },
  {
    id: 'stitching-halfsaree',
    title: 'Half Saree (Langa Voni) Tailoring',
    description: 'Custom pleated lehenga flare with built-in double can-can lining, matching raw silk blouse, and coordinated voni drape.',
    price: 'Starting from ₹4,500',
    turnaround: '7-12 business days',
    image: '',
    images: [],
  },
  {
    id: 'stitching-gown',
    title: 'Designer Gown & Anarkali Stitching',
    description: 'Made-to-measure evening gowns, reception dresses, and 32-kali flare anarkali suits crafted to your exact measurements.',
    price: 'Starting from ₹5,000',
    turnaround: '10-15 business days',
    image: '',
    images: [],
  },
  {
    id: 'stitching-fallpico',
    title: 'Saree Fall, Pico & Kuchu Tassels',
    description: 'Neat saree fall stitching, edge pico finishing, and handmade silk thread kuchu tassels on the pallu.',
    price: 'Starting from ₹500',
    turnaround: '2-3 business days',
    image: '',
    images: [],
  },
];
