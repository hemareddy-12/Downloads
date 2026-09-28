import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { hashPassword, verifyPassword, createToken, verifyToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & credentials (stored strictly on backend, never exposed to frontend)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'labelhemareddy@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hemareddy2026';
const JWT_SECRET = process.env.ADMIN_SECRET || 'label-hemareddy-haute-couture-secret-2026';

// In-memory revoked session tokens set
const revokedAdminTokens = new Set();

// Enable JSON body parsing (with high limit for image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration - allow all origins for public website while restricting admin endpoints via auth token
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Uploads directory
const uploadsDir = path.join(rootDir, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database file
const dataDir = path.join(rootDir, 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'store.json');

// Initial default schema - 100% clean, no demo products, no demo model images
const defaultData = {
  adminUsers: [],
  products: [],
  categories: [
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
  ],
  creations: [],
  stitchingServices: [
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
  ],
  stitchingPhotos: [],
  brandSettings: {
    brandName: 'hemareddy',
    tagline: '',
    logoUrl: '/uploads/brand_logo.png',
    profilePhotoUrl: '',
    description: '',
    watermarkSettings: {
      enabled: true,
      opacity: 0.05,
      size: 480,
      position: 'center',
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
  },
  websiteSettings: {
    homepage: {
      heroHeading: 'Handcrafted Couture & Bespoke Stitching',
      heroSubtitle: '',
      heroImageUrl: '',
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
    contact: {
      whatsapp: '+91 98765 43210',
      whatsappNumber: '919876543210',
      phone: '+91 98765 43210',
      email: 'contact@hemareddy.com',
      instagram: 'https://instagram.com/hemareddy',
      instagramHandle: '@hemareddy',
      address: 'Studio hemareddy, Hyderabad, India',
      contactText: 'Whether you have an inquiry regarding ready-to-ship silks, bespoke bridal stitching, or a custom design, we are delighted to assist you.',
      businessHours: 'Mon - Sat: 10:30 AM - 8:00 PM',
    },
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
      primaryColor: '#C8A97E',
      secondaryColor: '#B5644D',
      backgroundColor: '#FAF8F5',
      textColor: '#1E1C1A',
      headerBgColor: '#FAF8F5',
    },
  },
  aboutSettings: {
    heading: 'About Me',
    subheading: 'Where Heritage Weaves Meet Precision Haute Couture',
    photoUrl: '',
    quotation: '',
    introduction: 'Welcome to hemareddy. Every creation, cut, and seam is personally designed and supervised to celebrate timeless craftsmanship and modern grace.',
    story: 'What started at my personal stitching desk with hand-guided scissors and vintage looms quickly blossomed into hemareddy. Every stitch is placed with intention, ensuring each saree, lehenga, and gown feels like a second skin.',
    passion: 'From selecting pure mulberry silks to hand-drawn embroidery patterns and exacting measurement cuts, my craft is anchored in celebrating the timeless grace of South Asian couture.',
    promise: 'Established with one uncompromising promise: no two women are the same, and your ceremonial garments should reflect your distinct grandeur.',
  },
  contactSettings: {
    whatsapp: '+91 98765 43210',
    whatsappNumber: '919876543210',
    phone: '+91 98765 43210',
    email: 'contact@hemareddy.com',
    instagram: 'https://instagram.com/hemareddy',
    instagramHandle: '@hemareddy',
    address: 'Studio hemareddy, Hyderabad, India',
    contactText: 'Whether you have an inquiry regarding ready-to-ship silks, bespoke bridal stitching, or an existing order, we are delighted to assist you.',
    businessHours: 'Mon - Sat: 10:30 AM - 8:00 PM',
  },
  orders: [],
  enquiries: [],
  messages: [],
  cloudStorageSettings: {
    provider: 'auto', // 'cloudinary' | 'imgbb' | 'server' | 'auto'
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      folder: 'label_hemareddy',
    },
    imgbb: {
      apiKey: process.env.IMGBB_API_KEY || '',
    },
  },
};

// Database helper functions
const readDb = () => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      const parsed = JSON.parse(data);
      const db = { ...defaultData, ...parsed };
      db.adminUsers = db.adminUsers || [];
      db.cloudStorageSettings = {
        ...defaultData.cloudStorageSettings,
        ...(parsed.cloudStorageSettings || {}),
        cloudinary: {
          ...defaultData.cloudStorageSettings.cloudinary,
          ...(parsed.cloudStorageSettings?.cloudinary || {}),
        },
        imgbb: {
          ...defaultData.cloudStorageSettings.imgbb,
          ...(parsed.cloudStorageSettings?.imgbb || {}),
        },
      };
      return db;
    }
  } catch (err) {
    console.error('[DB Read Error]:', err);
  }
  return { ...defaultData, adminUsers: [] };
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB Write Error]:', err);
  }
};

// Seed/Bootstrap default Owner accounts with secure cryptographic password hashes
const ensureAdminAccounts = () => {
  const db = readDb();
  db.adminUsers = db.adminUsers || [];

  const defaultAccounts = [
    { email: 'labelhemareddy@gmail.com', name: 'Hema Reddy (Owner & Admin)', role: 'owner' },
    { email: 'contact@hemareddy.com', name: 'Hema Reddy (Owner & Admin)', role: 'owner' },
    { email: 'admin@labelhemareddy.com', name: 'Hema Reddy (Platform Admin)', role: 'owner' },
    { email: 'lomadahemareddy@gmail.com', name: 'Hema Reddy (Owner & Admin)', role: 'owner' },
  ];

  if (process.env.ADMIN_EMAIL) {
    const envEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (!defaultAccounts.some(a => a.email.toLowerCase() === envEmail)) {
      defaultAccounts.push({ email: envEmail, name: 'Hema Reddy (Owner & Admin)', role: 'owner' });
    }
  }

  let modified = false;
  const initialPassword = process.env.ADMIN_PASSWORD || 'hemareddy2026';

  for (const acct of defaultAccounts) {
    const exists = db.adminUsers.some(u => u.email?.toLowerCase() === acct.email.toLowerCase());
    if (!exists) {
      const { salt, hash } = hashPassword(initialPassword);
      db.adminUsers.push({
        id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: acct.email.toLowerCase(),
        name: acct.name,
        role: acct.role,
        salt,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      });
      modified = true;
    }
  }

  if (modified) {
    writeDb(db);
    console.log('[Label HemaReddy Server] Bootstrapped owner accounts with secure scrypt hashing.');
  }
};

// Initialize DB if not present
if (!fs.existsSync(dbFilePath)) {
  writeDb(defaultData);
}
ensureAdminAccounts();

// ==================== BACKEND AUTH MIDDLEWARE ====================
// Strictly protects every admin API route on the backend
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }

  const user = verifyToken(token, JWT_SECRET, revokedAdminTokens);
  if (!user) {
    return res.status(401).json({ 
      error: 'Unauthorized: Valid Admin session required to access this resource',
      code: 'UNAUTHORIZED_ADMIN'
    });
  }

  if (user.role && user.role !== 'owner' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Insufficient administrator permissions',
      code: 'FORBIDDEN_ADMIN'
    });
  }

  req.adminUser = user;
  next();
};

// ==================== AUTH ROUTES ====================
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const db = readDb();
  db.adminUsers = db.adminUsers || [];

  // 1. Search in persistent hashed adminUsers collection
  let user = db.adminUsers.find(u => u.email?.toLowerCase() === cleanEmail);
  let isMatch = false;

  if (user && user.passwordHash && user.salt) {
    isMatch = verifyPassword(cleanPassword, user.passwordHash, user.salt);
  }

  // 2. Fallback check for 'admin' username shortcut or env credentials
  if (!isMatch) {
    const envEmail = (process.env.ADMIN_EMAIL || 'admin@labelhemareddy.com').toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD || 'hemareddy2026';
    
    if ((cleanEmail === envEmail || cleanEmail === 'admin') && cleanPassword === envPass) {
      isMatch = true;
      if (!user) {
        user = db.adminUsers.find(u => u.email?.toLowerCase() === envEmail);
      }
      if (!user) {
        const { salt, hash } = hashPassword(cleanPassword);
        user = {
          id: `admin-${Date.now()}`,
          email: envEmail,
          name: 'Hema Reddy (Owner & Admin)',
          role: 'owner',
          salt,
          passwordHash: hash,
          createdAt: new Date().toISOString(),
        };
        db.adminUsers.push(user);
        writeDb(db);
      }
    }
  }

  if (isMatch && user) {
    const token = createToken(user.email, user.role || 'owner', JWT_SECRET);
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'Hema Reddy (Owner & Admin)',
        role: user.role || 'owner',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }

  const user = verifyToken(token, JWT_SECRET, revokedAdminTokens);
  if (user) {
    const db = readDb();
    const account = (db.adminUsers || []).find(u => u.email?.toLowerCase() === user.email.toLowerCase());
    return res.json({
      authenticated: true,
      user: {
        email: user.email,
        name: account?.name || 'Hema Reddy (Owner & Admin)',
        role: user.role || account?.role || 'owner',
      },
    });
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }
  if (token) {
    revokedAdminTokens.add(token);
  }
  return res.json({ success: true });
});

// Check initial admin setup status
app.get('/api/admin/setup-status', (req, res) => {
  const db = readDb();
  db.adminUsers = db.adminUsers || [];
  const ownerEmail = 'labelhemareddy@gmail.com';
  const owner = db.adminUsers.find(u => u.email?.toLowerCase() === ownerEmail);
  
  res.json({
    adminEmail: ownerEmail,
    initialSetupCompleted: Boolean(owner && owner.initialSetupCompleted),
  });
});

// Configure or register Owner/Admin account
app.post('/api/admin/setup', (req, res) => {
  const db = readDb();
  const isTunnel = Boolean(
    req.headers['cf-connecting-ip'] || 
    req.headers['cf-ray'] || 
    (req.headers['host'] && req.headers['host'].includes('trycloudflare.com'))
  );
  const isLocal = !isTunnel && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  const token = req.headers['authorization']?.replace('Bearer ', '');
  const authUser = verifyToken(token, JWT_SECRET, revokedAdminTokens);
  const keyHeader = req.headers['x-setup-key'];
  const hasKey = keyHeader && (keyHeader === JWT_SECRET || keyHeader === process.env.ADMIN_SETUP_KEY);

  const { email, password, name, role } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const isTargetOwner = cleanEmail === 'labelhemareddy@gmail.com';
  const existingIdx = db.adminUsers.findIndex(u => u.email?.toLowerCase() === cleanEmail);
  const existingUser = existingIdx !== -1 ? db.adminUsers[existingIdx] : null;

  // Security check:
  // If setup has already been completed, only allow subsequent changes if:
  // 1) The request comes from localhost, OR
  // 2) An authenticated admin makes the request, OR
  // 3) An admin setup secret key is provided.
  if (existingUser?.initialSetupCompleted && !isLocal && !authUser && !hasKey) {
    return res.status(403).json({
      error: 'Initial setup has already been completed for this admin account. Please sign in using your permanent email and password.',
      setupCompleted: true,
    });
  }

  // If a remote unauthenticated user attempts to setup an email other than the authorized owner:
  if (!isTargetOwner && !isLocal && !authUser && !hasKey) {
    return res.status(403).json({
      error: 'Forbidden: Admin setup is restricted to the authorized owner account (labelhemareddy@gmail.com).',
    });
  }

  if (password.trim().length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const { salt, hash } = hashPassword(password.trim());

  const userData = {
    id: existingUser ? existingUser.id : `admin-${Date.now()}`,
    email: cleanEmail,
    name: name || existingUser?.name || 'Hema Reddy (Owner & Admin)',
    role: role || existingUser?.role || 'owner',
    salt,
    passwordHash: hash,
    initialSetupCompleted: true,
    updatedAt: new Date().toISOString(),
    createdAt: existingUser ? existingUser.createdAt : new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    db.adminUsers[existingIdx] = userData;
  } else {
    db.adminUsers.push(userData);
  }

  writeDb(db);

  // Issue session JWT token immediately so owner is logged in seamlessly upon setup
  const sessionToken = createToken(userData.email, userData.role || 'owner', JWT_SECRET);

  res.json({
    success: true,
    message: 'Your permanent admin credentials have been securely saved. You are now logged in.',
    token: sessionToken,
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
  });
});

// Admin change password
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  const db = readDb();
  db.adminUsers = db.adminUsers || [];
  const user = db.adminUsers.find(u => u.email?.toLowerCase() === req.adminUser.email.toLowerCase());

  if (!user || !verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const { salt, hash } = hashPassword(newPassword.trim());
  user.salt = salt;
  user.passwordHash = hash;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// Admin list accounts (Admin only - returns IDs and emails, never hashes or salts)
app.get('/api/admin/accounts', requireAdmin, (req, res) => {
  const db = readDb();
  const accounts = (db.adminUsers || []).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
  res.json(accounts);
});

// ==================== PRODUCTS API ====================
// Public: Customers can view products
app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDb();
  const prod = (db.products || []).find(p => p.id === req.params.id);
  if (prod) return res.json(prod);
  return res.status(404).json({ error: 'Product not found' });
});

// Admin Only: Add, edit, delete sale products
app.post('/api/products', requireAdmin, (req, res) => {
  const db = readDb();
  const newProduct = {
    ...req.body,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.products = db.products || [];
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const idx = (db.products || []).findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.products[idx] = { ...db.products[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeDb(db);
    return res.json(db.products[idx]);
  }
  return res.status(404).json({ error: 'Product not found' });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const db = readDb();
  db.products = (db.products || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ==================== MY CREATIONS API ====================
// Public: Customers view portfolio lookbook
app.get('/api/creations', (req, res) => {
  const db = readDb();
  const list = [...(db.creations || [])];
  list.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  res.json(list);
});

// Admin Only: Add, edit, delete, reorder creations
app.post('/api/creations', requireAdmin, (req, res) => {
  const db = readDb();
  const newCreation = {
    ...req.body,
    id: `creation-${Date.now()}`,
    order: db.creations?.length || 0,
    createdAt: new Date().toISOString(),
  };
  db.creations = db.creations || [];
  db.creations.push(newCreation);
  writeDb(db);
  res.status(201).json(newCreation);
});

app.put('/api/creations/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const idx = (db.creations || []).findIndex(c => c.id === req.params.id);
  if (idx !== -1) {
    db.creations[idx] = { ...db.creations[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeDb(db);
    return res.json(db.creations[idx]);
  }
  return res.status(404).json({ error: 'Creation not found' });
});

app.delete('/api/creations/:id', requireAdmin, (req, res) => {
  const db = readDb();
  db.creations = (db.creations || []).filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/creations/reorder', requireAdmin, (req, res) => {
  const db = readDb();
  const { orderedList } = req.body || {};
  if (Array.isArray(orderedList)) {
    db.creations = orderedList.map((item, index) => ({
      ...item,
      order: index,
    }));
    writeDb(db);
    return res.json(db.creations);
  }
  return res.status(400).json({ error: 'orderedList array required' });
});

// ==================== STITCHING API ====================
// Public: View stitching services & work photos
app.get('/api/stitching', (req, res) => {
  const db = readDb();
  res.json(db.stitchingServices || []);
});

app.get('/api/stitching/photos', (req, res) => {
  const db = readDb();
  res.json(db.stitchingPhotos || []);
});

// Admin Only: Add, edit, delete stitching services & work photos
app.post('/api/stitching', requireAdmin, (req, res) => {
  const db = readDb();
  const newService = {
    ...req.body,
    id: `stitch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.stitchingServices = db.stitchingServices || [];
  db.stitchingServices.push(newService);
  writeDb(db);
  res.status(201).json(newService);
});

app.put('/api/stitching/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const idx = (db.stitchingServices || []).findIndex(s => s.id === req.params.id);
  if (idx !== -1) {
    db.stitchingServices[idx] = { ...db.stitchingServices[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeDb(db);
    return res.json(db.stitchingServices[idx]);
  }
  return res.status(404).json({ error: 'Stitching service not found' });
});

app.delete('/api/stitching/:id', requireAdmin, (req, res) => {
  const db = readDb();
  db.stitchingServices = (db.stitchingServices || []).filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/stitching/photos', requireAdmin, (req, res) => {
  const db = readDb();
  const { photos } = req.body || {};
  if (Array.isArray(photos)) {
    db.stitchingPhotos = photos;
    writeDb(db);
    return res.json(db.stitchingPhotos);
  }
  return res.status(400).json({ error: 'photos array required' });
});

// ==================== SETTINGS API ====================
// Public: Fetch settings
app.get('/api/settings/brand', (req, res) => {
  const db = readDb();
  res.json(db.brandSettings || defaultData.brandSettings);
});

app.get('/api/settings/website', (req, res) => {
  const db = readDb();
  res.json(db.websiteSettings || defaultData.websiteSettings);
});

app.get('/api/settings/about', (req, res) => {
  const db = readDb();
  res.json(db.aboutSettings || defaultData.aboutSettings);
});

app.get('/api/settings/contact', (req, res) => {
  const db = readDb();
  res.json(db.contactSettings || defaultData.contactSettings);
});

// Admin Only: Save settings
app.put('/api/settings/brand', requireAdmin, (req, res) => {
  const db = readDb();
  db.brandSettings = { ...db.brandSettings, ...req.body };
  writeDb(db);
  res.json(db.brandSettings);
});

app.put('/api/settings/website', requireAdmin, (req, res) => {
  const db = readDb();
  db.websiteSettings = { ...db.websiteSettings, ...req.body };
  writeDb(db);
  res.json(db.websiteSettings);
});

app.put('/api/settings/about', requireAdmin, (req, res) => {
  const db = readDb();
  db.aboutSettings = { ...db.aboutSettings, ...req.body };
  writeDb(db);
  res.json(db.aboutSettings);
});

app.put('/api/settings/contact', requireAdmin, (req, res) => {
  const db = readDb();
  db.contactSettings = { ...db.contactSettings, ...req.body };
  // Keep brandSettings.socialLinks synchronized
  db.brandSettings = db.brandSettings || {};
  db.brandSettings.socialLinks = {
    ...db.brandSettings.socialLinks,
    whatsapp: req.body.whatsapp,
    whatsappNumber: req.body.whatsappNumber,
    phone: req.body.phone,
    email: req.body.email,
    instagram: req.body.instagram,
    instagramHandle: req.body.instagramHandle,
    address: req.body.address,
    businessHours: req.body.businessHours,
  };
  writeDb(db);
  res.json(db.contactSettings);
});

// ==================== CLOUD STORAGE HELPERS ====================
const getCloudStorageConfig = () => {
  const db = readDb();
  const stored = db.cloudStorageSettings || {};
  return {
    provider: stored.provider || 'auto',
    cloudinary: {
      cloudName: (stored.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
      apiKey: (stored.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY || '').trim(),
      apiSecret: (stored.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET || '').trim(),
      folder: (stored.cloudinary?.folder || 'label_hemareddy').trim(),
    },
    imgbb: {
      apiKey: (stored.imgbb?.apiKey || process.env.IMGBB_API_KEY || '').trim(),
    },
  };
};

const uploadToCloudinary = async (dataUrl, filename, folder) => {
  const config = getCloudStorageConfig();
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  const cleanBase = (filename || 'item').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${cleanBase}_${Date.now()}`;

  const uploadResult = await cloudinary.uploader.upload(dataUrl, {
    folder: folder || config.cloudinary.folder || 'label_hemareddy',
    public_id: publicId,
    resource_type: 'auto',
    overwrite: false,
  });

  return uploadResult.secure_url;
};

const uploadToImgBB = async (dataUrl, filename) => {
  const config = getCloudStorageConfig();
  if (!config.imgbb.apiKey) {
    return null;
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const base64Data = matches ? matches[2] : dataUrl;

  const params = new URLSearchParams();
  params.append('key', config.imgbb.apiKey);
  params.append('image', base64Data);
  if (filename) params.append('name', filename.replace(/\.[^/.]+$/, ''));

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: params,
  });

  const json = await response.json();
  if (json.success && json.data && json.data.url) {
    return json.data.url;
  }
  throw new Error(json.error?.message || 'ImgBB upload failed');
};

// ==================== IMAGE UPLOADS & CLOUD STORAGE API ====================
// Admin Only: Upload images permanently to Cloudinary / ImgBB / Independent Server Storage
app.post('/api/upload', requireAdmin, async (req, res) => {
  const { dataUrl, filename, folder = 'products' } = req.body || {};
  if (!dataUrl) {
    return res.status(400).json({ error: 'dataUrl is required' });
  }

  // If already an external HTTPS URL (e.g. pasted directly), return as is
  if (typeof dataUrl === 'string' && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
    return res.json({ url: dataUrl, provider: 'external', permanent: true });
  }

  const config = getCloudStorageConfig();

  // 1. Cloudinary upload (if configured and provider is 'auto' or 'cloudinary')
  if ((config.provider === 'auto' || config.provider === 'cloudinary') &&
      config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const cloudUrl = await uploadToCloudinary(dataUrl, filename, folder);
      if (cloudUrl) {
        console.log(`[Cloud Storage] Image permanently saved to Cloudinary CDN: ${cloudUrl}`);
        return res.json({ 
          url: cloudUrl, 
          provider: 'cloudinary',
          permanent: true,
          message: 'Saved permanently to Cloudinary Cloud CDN' 
        });
      }
    } catch (cloudErr) {
      console.error('[Cloudinary Upload Error]:', cloudErr);
    }
  }

  // 2. ImgBB upload (if configured and provider is 'auto' or 'imgbb')
  if ((config.provider === 'auto' || config.provider === 'imgbb') && config.imgbb.apiKey) {
    try {
      const imgbbUrl = await uploadToImgBB(dataUrl, filename);
      if (imgbbUrl) {
        console.log(`[Cloud Storage] Image permanently saved to ImgBB CDN: ${imgbbUrl}`);
        return res.json({ 
          url: imgbbUrl, 
          provider: 'imgbb',
          permanent: true,
          message: 'Saved permanently to ImgBB Cloud CDN' 
        });
      }
    } catch (imgbbErr) {
      console.error('[ImgBB Upload Error]:', imgbbErr);
    }
  }

  // 3. Fallback: Save permanently to dedicated server uploads storage with full absolute public URL
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.json({ url: dataUrl, provider: 'direct', permanent: true });
    }

    let ext = (matches[1].split('/')[1] || 'png').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];
    const cleanName = (filename || 'img')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 20);
    const safeFilename = `${Date.now()}_${cleanName || 'img'}.${ext}`;
    const filePath = path.join(uploadsDir, safeFilename);

    // Write binary copy to server disk (100% decoupled from user's local laptop folder)
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const forwardedProto = req.headers['x-forwarded-proto'];
    const forwardedHost = req.headers['x-forwarded-host'];
    const protocol = forwardedProto || req.protocol || 'http';
    const host = forwardedHost || req.get('host') || `localhost:${PORT}`;
    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`;

    return res.json({ 
      url: publicUrl, 
      relativePath: `/uploads/${safeFilename}`,
      provider: 'server',
      permanent: true,
      message: 'Saved to independent server disk storage with absolute public URL'
    });
  } catch (err) {
    console.error('Upload handling error:', err);
    return res.json({ url: dataUrl, provider: 'dataUrl', permanent: false });
  }
});

// Admin Only: Get Cloud Storage settings & status (masked credentials)
app.get('/api/settings/storage', requireAdmin, (req, res) => {
  const config = getCloudStorageConfig();
  const hasCloudinary = Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);
  const hasImgbb = Boolean(config.imgbb.apiKey);

  let activeProvider = 'server';
  if (config.provider === 'cloudinary' && hasCloudinary) activeProvider = 'cloudinary';
  else if (config.provider === 'imgbb' && hasImgbb) activeProvider = 'imgbb';
  else if (config.provider === 'auto') {
    if (hasCloudinary) activeProvider = 'cloudinary';
    else if (hasImgbb) activeProvider = 'imgbb';
  }

  res.json({
    provider: config.provider,
    activeProvider,
    cloudinary: {
      cloudName: config.cloudinary.cloudName,
      apiKey: config.cloudinary.apiKey ? `${config.cloudinary.apiKey.slice(0, 4)}...${config.cloudinary.apiKey.slice(-3)}` : '',
      hasSecret: Boolean(config.cloudinary.apiSecret),
      folder: config.cloudinary.folder,
      isConfigured: hasCloudinary,
    },
    imgbb: {
      hasApiKey: hasImgbb,
      isConfigured: hasImgbb,
    },
  });
});

// Admin Only: Update Cloud Storage settings
app.put('/api/settings/storage', requireAdmin, (req, res) => {
  const { provider, cloudinary: cConfig, imgbb: iConfig } = req.body || {};
  const db = readDb();
  db.cloudStorageSettings = db.cloudStorageSettings || { ...defaultData.cloudStorageSettings };

  if (provider) db.cloudStorageSettings.provider = provider;

  if (cConfig) {
    db.cloudStorageSettings.cloudinary = db.cloudStorageSettings.cloudinary || {};
    if (cConfig.cloudName !== undefined) db.cloudStorageSettings.cloudinary.cloudName = cConfig.cloudName.trim();
    if (cConfig.apiKey !== undefined && !cConfig.apiKey.includes('...')) {
      db.cloudStorageSettings.cloudinary.apiKey = cConfig.apiKey.trim();
    }
    if (cConfig.apiSecret && cConfig.apiSecret.trim()) {
      db.cloudStorageSettings.cloudinary.apiSecret = cConfig.apiSecret.trim();
    }
    if (cConfig.folder !== undefined) db.cloudStorageSettings.cloudinary.folder = cConfig.folder.trim();
  }

  if (iConfig) {
    db.cloudStorageSettings.imgbb = db.cloudStorageSettings.imgbb || {};
    if (iConfig.apiKey !== undefined && iConfig.apiKey.trim()) {
      db.cloudStorageSettings.imgbb.apiKey = iConfig.apiKey.trim();
    }
  }

  writeDb(db);
  res.json({ success: true, message: 'Cloud storage settings saved successfully' });
});

// Admin Only: Test Cloud Storage connection
app.post('/api/settings/storage/test', requireAdmin, async (req, res) => {
  const { provider = 'cloudinary', cloudinary: testCloud, imgbb: testImgbb } = req.body || {};
  const config = getCloudStorageConfig();

  const testPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAEDkt/dAAAAABJRU5ErkJggg==';

  if (provider === 'cloudinary') {
    const cloudName = testCloud?.cloudName || config.cloudinary.cloudName;
    const apiKey = (testCloud?.apiKey && !testCloud.apiKey.includes('...')) ? testCloud.apiKey : config.cloudinary.apiKey;
    const apiSecret = testCloud?.apiSecret || config.cloudinary.apiSecret;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(400).json({ error: 'Please enter Cloud Name, API Key, and API Secret to test Cloudinary.' });
    }

    try {
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
        secure: true,
      });

      const uploadRes = await cloudinary.uploader.upload(testPixel, {
        folder: 'label_hemareddy/test',
        public_id: `connection_test_${Date.now()}`,
        tags: ['test', 'hemareddy'],
      });

      return res.json({
        success: true,
        message: 'Cloudinary CDN connected successfully! Verified permanent image storage is active.',
        testUrl: uploadRes.secure_url,
      });
    } catch (err) {
      console.error('[Cloudinary Test Error]:', err);
      return res.status(400).json({
        error: `Cloudinary connection failed: ${err.message || 'Check your credentials'}`,
      });
    }
  }

  if (provider === 'imgbb') {
    const apiKey = testImgbb?.apiKey || config.imgbb.apiKey;
    if (!apiKey) {
      return res.status(400).json({ error: 'Please enter your ImgBB API key to test.' });
    }

    try {
      const params = new URLSearchParams();
      params.append('key', apiKey.trim());
      params.append('image', testPixel.split(',')[1]);
      params.append('name', 'test_pixel');

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: params,
      });
      const json = await response.json();
      if (json.success && json.data?.url) {
        return res.json({
          success: true,
          message: 'ImgBB Cloud connected successfully!',
          testUrl: json.data.url,
        });
      }
      return res.status(400).json({ error: json.error?.message || 'ImgBB test failed' });
    } catch (err) {
      return res.status(400).json({ error: err.message || 'ImgBB connection error' });
    }
  }

  return res.json({ success: true, message: 'Server storage is active and ready.' });
});

// ==================== ORDERS API ====================
// Public: Customers create orders
app.post('/api/orders', (req, res) => {
  const db = readDb();
  const orderId = `HR-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    ...req.body,
    orderId,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  db.orders = db.orders || [];
  db.orders.push(newOrder);
  writeDb(db);
  res.status(201).json(newOrder);
});

// Public: Customer tracks their own order by orderId
app.get('/api/orders/track/:orderId', (req, res) => {
  const db = readDb();
  const order = (db.orders || []).find(o => 
    o.orderId?.toLowerCase() === req.params.orderId?.toLowerCase()
  );
  if (order) return res.json(order);
  return res.status(404).json({ error: 'Order not found' });
});

// Admin Only: View all orders & update status
app.get('/api/orders', requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.orders || []);
});

app.put('/api/orders/:orderId/status', requireAdmin, (req, res) => {
  const db = readDb();
  const idx = (db.orders || []).findIndex(o => o.orderId === req.params.orderId);
  if (idx !== -1) {
    db.orders[idx].status = req.body.status || db.orders[idx].status;
    db.orders[idx].updatedAt = new Date().toISOString();
    writeDb(db);
    return res.json(db.orders[idx]);
  }
  return res.status(404).json({ error: 'Order not found' });
});

// ==================== ENQUIRIES & MESSAGES ====================
// Public: Customer consultation / contact
app.post('/api/enquiries', (req, res) => {
  const db = readDb();
  const newEnquiry = {
    ...req.body,
    id: `enq-${Date.now()}`,
    status: 'Unread',
    createdAt: new Date().toISOString(),
  };
  db.enquiries = db.enquiries || [];
  db.enquiries.push(newEnquiry);
  writeDb(db);
  res.status(201).json(newEnquiry);
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const newMsg = {
    ...req.body,
    id: `msg-${Date.now()}`,
    status: 'Unread',
    createdAt: new Date().toISOString(),
  };
  db.messages = db.messages || [];
  db.messages.push(newMsg);
  writeDb(db);
  res.status(201).json(newMsg);
});

// Admin Only: View enquiries & messages
app.get('/api/enquiries', requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.enquiries || []);
});

app.get('/api/messages', requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.messages || []);
});

// ==================== STATIC FRONTEND SERVING & SPA FALLBACK ====================
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // SPA Route handling: send index.html for all customer and admin pages
  app.use((req, res) => {
    // If request has file extension and was not found, return 404
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      return res.status(404).end();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.send('Production build not found. Run `npm run build` to compile the frontend.');
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Label HemaReddy Server] Running on http://localhost:${PORT}`);
  console.log(`[Label HemaReddy Server] Admin email: ${ADMIN_EMAIL}`);
});
