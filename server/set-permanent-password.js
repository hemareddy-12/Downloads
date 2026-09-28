import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dbFilePath = path.join(rootDir, 'server', 'data', 'store.json');

const email = (process.argv[2] && process.argv[2].includes('@')) ? process.argv[2] : 'labelhemareddy@gmail.com';
const password = (process.argv[2] && !process.argv[2].includes('@')) ? process.argv[2] : process.argv[3];

if (!password || password.length < 6) {
  console.log(`
=============================================================
  LABEL HEMAREDDY - SET PERMANENT OWNER PASSWORD
=============================================================
Usage:
  node server/set-permanent-password.js "YourChosenPassword"
  OR
  node server/set-permanent-password.js labelhemareddy@gmail.com "YourChosenPassword"

Notes:
  - Minimum 6 characters required.
  - Password will be cryptographically hashed using scrypt + 128-bit salt.
  - Plaintext password is NEVER saved to disk or code.
=============================================================
  `);
  process.exit(1);
}

try {
  let db = {};
  if (fs.existsSync(dbFilePath)) {
    db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  }
  db.adminUsers = db.adminUsers || [];

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const { salt, hash } = hashPassword(cleanPassword);
  const existingIdx = db.adminUsers.findIndex(u => u.email?.toLowerCase() === cleanEmail);

  const adminRecord = {
    id: existingIdx !== -1 ? db.adminUsers[existingIdx].id : `admin-${Date.now()}`,
    email: cleanEmail,
    name: 'Hema Reddy (Owner & Admin)',
    role: 'owner',
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
  PERMANENT OWNER CREDENTIALS SET SUCCESSFULLY!
=============================================================
  Admin Email:     ${cleanEmail}
  Status:          Permanent credentials configured & saved
  Security:        scrypt + 128-bit salt (Zero plaintext stored)
  Ready to Login:  Use this email and your password anytime at /admin/login
=============================================================
  `);
} catch (err) {
  console.error('[Error] Failed to set permanent password:', err);
  process.exit(1);
}
