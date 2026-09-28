# Label HemaReddy — Haute Couture E-Commerce Platform

A bespoke, production-ready luxury fashion e-commerce website and secure Admin Dashboard built for **Label HemaReddy**.

---

## 💎 Brand Identity & Core Principles

- **Official Brand Name**: `Label HemaReddy`
- **Aesthetic**: Premium, Feminine, High Fashion, Boutique Atelier, Clean & Trustworthy
- **Color Palette**: Warm Rose Ivory (`#FAF8F5`), Antique Gold (`#C8A97E`), Deep Charcoal (`#171617`), and Soft Blush
- **Typography**: Editorial Playfair Display serif paired with modern Plus Jakarta Sans

---

## ✨ Key Features

### 1. Customer-Facing Boutique Storefront
- **Dynamic Header & Navigation**: Category links, collection search, wishlist, shopping bag drawer, and quick owner admin link.
- **Hero Showcase**: High-impact editorial imagery, luxury typography, trust highlights, and direct CTAs.
- **Curated Collections**: Sarees, Half Sarees (Langa Voni), Evening Gowns/Dresses, and Custom/Stitched Outfits.
- **Product Catalog (`/shop`)**:
  - Real-time search across titles, fabrics, and keywords
  - Category filtering
  - Price range slider
  - Sorting (Newest Drops, Featured First, Price Low-to-High, Price High-to-Low)
  - Badges: `New Drop`, `Featured`, `% Off`, `Made to Order`
- **Product Details (`/product/:id`)**:
  - Multi-image gallery with thumbnail switcher
  - Size and color selectors
  - Fabric, weave, details, and care instructions
  - Custom stitching notes input (e.g. blouse design, padding, fall/pico)
  - Instant Add to Bag & Instant Buy Now
  - Direct WhatsApp order button with pre-filled product details
- **Shopping Bag & Checkout (`/cart` & `/checkout`)**:
  - Slide-over bag drawer and full cart review page
  - Custom notes per garment preserved
  - Real-time subtotal, shipping calculation, and grand total
  - Full shipping address & contact information collection
  - Payment preferences: UPI/Bank Wire, Cash on Delivery, WhatsApp Confirmation
- **Order Confirmation & Tracking (`/order-confirmation` & `/track-order`)**:
  - Unique Order Reference ID (`LHR-XXXXX`)
  - Live visual timeline showing progress:
    `Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Ready` ➔ `Shipped` ➔ `Delivered`
- **Bespoke Custom Stitching Studio (`/custom-stitching`)**:
  - Dedicated consultation page for custom bridal blouses, half-sarees, and gowns
  - Photo/sketch reference upload
  - Measurement selection (guided video call or typed dimensions)
  - Saved directly to Firebase `enquiries` collection
- **Meet the Designer (`/about#designer`)**:
  - Hema Reddy's portrait photo, stitching philosophy, design work, and brand story
- **Contact Page (`/contact`)**:
  - Inquiry form saved to Firebase `messages`
  - Direct WhatsApp button, phone, email, opening hours, and studio address

---

### 2. Website Background Logo Watermark System
- **Your Exact Logo**: Uses your uploaded logo without distortion or stretching.
- **Aspect Ratio Protection**: Keeps natural width/height ratios intact at all times.
- **Non-Interfering**: Positioned behind all interactive elements (`pointer-events: none`, `z-index: 0`) ensuring buttons, inputs, and text remain 100% accessible.
- **Admin Brand Settings Controls**:
  - Upload/change logo image
  - Upload/change specific background watermark logo
  - Enable/disable watermark switch
  - Real-time opacity slider (1% to 30%)
  - Size slider (200px to 1000px)
  - Position selector: Centered, Top-Right, Bottom-Right, or Subtle Repeating Pattern
  - Fixed-to-viewport vs scrolling toggle
  - **Live interactive simulator** to test readability before saving

---

### 3. Secure Admin Dashboard (`/admin`)
- **Restricted Access**: Only authorized Admin users can access the dashboard.
- **Executive KPIs**: Total revenue, placed orders, active catalog pieces, pending bespoke consultations.
- **Product Management (`/admin/products`)**:
  - Full CRUD (Create, Read, Update, Delete)
  - Multi-image file uploads or image URLs
  - Regular and discount pricing
  - Stock quantity tracking & in-stock toggle
  - Badges: `New Arrival`, `Featured on Homepage`
  - Fabric, care instructions, and customisation details
- **Order Management (`/admin/orders`)**:
  - Filter orders by status
  - Customer shipping dossier inspection
  - 1-click status transitions (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Ready` ➔ `Shipped` ➔ `Delivered`)
  - Payment verification status
  - Direct WhatsApp quick message to patron
- **Category Taxonomy (`/admin/categories`)**:
  - Add, edit, or delete categories with banner images and URL slugs
- **Custom Stitching Enquiries (`/admin/enquiries`)**:
  - Review custom requests, measurement notes, and patron reference sketches
  - Direct WhatsApp contact shortcut
- **Brand & Watermark Settings (`/admin/brand-settings`)**:
  - Edit brand name (`Label HemaReddy`)
  - Upload brand logo
  - Configure background watermark with live preview
  - Update studio phone, email, address, and Instagram links
- **Designer Profile (`/admin/designer-profile`)**:
  - Upload Hema Reddy's portrait photo
  - Edit name, title, introduction quote, stitching passion, personal story, and brand journey

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 🔐 Owner Admin Access (Default Credentials)

- **Login URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@labelhemareddy.com`
- **Password**: `hemareddy2026`

*When connected to Firebase, you can manage admin accounts through Firebase Authentication.*

---

## 🔥 Firebase Setup & Integration Guide

The project is designed to run seamlessly out of the box in **Studio Mode** with rich preloaded boutique data and local persistence. When you are ready to connect your live Firebase project, follow these simple steps:

### Step 1: Create a Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `Label HemaReddy`.
3. In the project dashboard, enable:
   - **Authentication**: Email/Password provider.
   - **Cloud Firestore**: Start in production mode.
   - **Firebase Storage**: Default bucket.

### Step 2: Register a Web App
1. In Firebase Console, go to **Project Settings** (gear icon) ➔ **General**.
2. Under **Your apps**, click the Web icon `</>`.
3. Name it `Label HemaReddy Web` and click **Register app**.
4. You will see your Firebase SDK configuration object.

### Step 3: Enter Your Credentials in `.env`
Open the `.env` file in the root directory and paste your configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=label-hemareddy.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=label-hemareddy
VITE_FIREBASE_STORAGE_BUCKET=label-hemareddy.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

VITE_ADMIN_EMAIL=admin@labelhemareddy.com
```

### Step 4: Security Rules
The repository contains ready-to-deploy security rules:
- `firestore.rules`: Protects catalog and orders; permits public reading of products while locking writes to admins.
- `storage.rules`: Restricts product and logo assets to admins while allowing customers to upload measurement reference sketches.

Deploy rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```

---

## 📁 Project Structure

```
label-hemareddy/
├── firestore.rules                   # Production Firestore security rules
├── storage.rules                     # Firebase Storage security rules
├── .env.example                      # Template environment variables
├── .env                              # Active configuration
├── package.json                      # Dependencies & build scripts
├── tailwind.config.js                # Boutique luxury color palette & fonts
├── vite.config.js                    # Optimized Vite bundler configuration
└── src/
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx            # Header with logo, categories & bag count
    │   │   ├── Footer.jsx            # Brand story, atelier contact & links
    │   │   ├── WatermarkBackground.jsx # Dynamic non-distorting logo watermark
    │   │   ├── ProductCard.jsx       # Fashion card with badges & pricing
    │   │   └── ScrollToTop.jsx       # Viewport scroll restoration
    │   └── cart/
    │       └── CartDrawer.jsx        # Slide-over cart preview
    ├── context/
    │   ├── AuthContext.jsx           # Firebase Auth & Owner session
    │   ├── BrandContext.jsx          # Live branding, logo & watermark state
    │   ├── CartContext.jsx           # Bag operations & localStorage sync
    │   └── ProductContext.jsx        # Catalog inventory & categories
    ├── pages/
    │   ├── HomePage.jsx              # Customer homepage
    │   ├── ShopPage.jsx              # Filterable fashion catalog
    │   ├── ProductDetailPage.jsx     # Garment details & WhatsApp order
    │   ├── CustomStitchingPage.jsx   # Dedicated bespoke consultation page
    │   ├── AboutPage.jsx             # Brand heritage & Hema Reddy story
    │   ├── ContactPage.jsx           # Studio inquiry & hours
    │   ├── CartPage.jsx              # Full shopping bag
    │   ├── CheckoutPage.jsx          # Shipping address & order placement
    │   ├── OrderConfirmationPage.jsx # Receipt & Order ID
    │   ├── OrderTrackingPage.jsx     # Live visual progress tracker
    │   ├── NotFoundPage.jsx          # 404 handler
    │   └── admin/
    │       ├── AdminLoginPage.jsx    # Secure owner login
    │       ├── AdminLayout.jsx       # Admin sidebar & header
    │       ├── AdminDashboard.jsx    # Executive KPIs & recent orders
    │       ├── AdminProducts.jsx     # Multi-image product editor
    │       ├── AdminCategories.jsx   # Category taxonomy manager
    │       ├── AdminOrders.jsx       # Order fulfillment & status updates
    │       ├── AdminEnquiries.jsx    # Custom stitching consult requests
    │       ├── AdminMessages.jsx     # Contact form submissions
    │       ├── AdminBrandSettings.jsx# Logo upload & watermark controls
    │       └── AdminDesignerProfile.jsx# Designer biography & photo editor
    ├── services/
    │   ├── firebase.js               # Firebase client & configuration detection
    │   ├── productService.js         # Products & categories API
    │   ├── orderService.js           # Order placement & tracking API
    │   ├── enquiryService.js         # Custom stitching consults API
    │   └── settingsService.js        # Brand, logo & watermark sync
    ├── utils/
    │   ├── formatters.js             # INR ₹ currency & date formatters
    │   └── initialData.js            # Initial curated catalog & default settings
    ├── App.jsx                       # Routing & root layout
    ├── index.css                     # Tailwind directives & luxury styling
    └── main.jsx                      # App bootstrap
```
