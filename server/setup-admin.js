import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dbFilePath = path.join(rootDir, 'server', 'data', 'store.json');

const emailArg = process.argv[2] || process.env.ADMIN_EMAIL;
const passwordArg = process.argv[3] || process.env.ADMIN_PASSWORD;
const nameArg = process.argv[4] || 'Hema Reddy (Owner & Admin)';
const roleArg = process.argv[5] || 'owner';

if (!emailArg || !passwordArg) {
  console.log(`
=============================================================
  LABEL HEMAREDDY - SECURE ADMIN SETUP UTILITY
=============================================================
Usage:
  node server/setup-admin.js <email> <password> [name] [role]

Examples:
  node server/setup-admin.js contact@hemareddy.com "MyStrongPass123"
  node server/setup-admin.js admin@labelhemareddy.com "hemareddy2026" "Hema Reddy" owner

Notes:
  - Passwords are cryptographically hashed using scrypt + 128-bit salt.
  - Plaintext passwords are NEVER stored in the database or frontend.
=============================================================
  `);
  process.exit(1);
}

const cleanEmail = emailArg.trim().toLowerCase();
const cleanPassword = passwordArg.trim();

if (!cleanEmail.includes('@')) {
  console.error('[Error]: Invalid email address provided.');
  process.exit(1);
}

if (cleanPassword.length < 4) {
  console.error('[Error]: Password must be at least 4 characters long.');
  process.exit(1);
}

try {
  let db = {};
  if (fs.existsSync(dbFilePath)) {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    db = JSON.parse(raw);
  }

  db.adminUsers = db.adminUsers || [];

  const { salt, hash } = hashPassword(cleanPassword);
  const existingIdx = db.adminUsers.findIndex(u => u.email?.toLowerCase() === cleanEmail);

  const adminRecord = {
    id: existingIdx !== -1 ? db.adminUsers[existingIdx].id : `admin-${Date.now()}`,
    email: cleanEmail,
    name: nameArg,
    role: roleArg,
    salt,
    passwordHash: hash,
    initialSetupCompleted: true,
    createdAt: existingIdx !== -1 ? db.adminUsers[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    db.adminUsers[existingIdx] = adminRecord;
  } else {
    db.adminUsers.push(adminRecord);
  }

  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf8');

  console.log(`
=============================================================
  ADMIN ACCOUNT CONFIGURED SUCCESSFULLY
=============================================================
  Email:        ${cleanEmail}
  Role:         ${roleArg}
  Name:         ${nameArg}
  Security:     scrypt + 128-bit cryptographic salt
  Plaintext:    NEVER stored (0 plain text saved)
=============================================================
  `);
} catch (err) {
  console.error('[Error]: Failed to configure admin account:', err);
  process.exit(1);
}
