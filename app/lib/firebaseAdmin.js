import admin from 'firebase-admin';


const firebaseConfig = {
  apiKey: "AIzaSyCeg_O8nwyKaW5n5IoCXdYstE5EY9Q0dmU",
  authDomain: "blackjack-8d304.firebaseapp.com",
  projectId: "blackjack-8d304",
  storageBucket: "blackjack-8d304.firebasestorage.app",
  messagingSenderId: "157827700867",
  appId: "1:157827700867:web:ad74ccadbb4ea1f155e3b6"
};






// Log environment loading
console.log('[Firebase Admin] Loading environment variables...');

// Validate environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[Firebase Admin] Missing environment variable: ${envVar}`);
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

// Log environment variable values (remove in production)
console.log('[Firebase Admin] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('[Firebase Admin] FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.slice(0, 50) + '...' : 'undefined');
console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 'undefined');

// Check if private key starts and ends correctly
if (!process.env.FIREBASE_PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----')) {
  console.error('[Firebase Admin] FIREBASE_PRIVATE_KEY does not start with -----BEGIN PRIVATE KEY-----');
  throw new Error('Invalid FIREBASE_PRIVATE_KEY format');
}
if (!process.env.FIREBASE_PRIVATE_KEY.endsWith('-----END PRIVATE KEY-----\n')) {
  console.error('[Firebase Admin] FIREBASE_PRIVATE_KEY does not end with -----END PRIVATE KEY-----');
  throw new Error('Invalid FIREBASE_PRIVATE_KEY format');
}

if (!admin.apps.length) {
  try {
    const credential = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    console.log('[Firebase Admin] Parsed privateKey (first 50 chars):', credential.privateKey.slice(0, 50) + '...');
    console.log('[Firebase Admin] Attempting to initialize with credential:', {
      projectId: credential.projectId,
      clientEmail: credential.clientEmail,
      privateKey: credential.privateKey.slice(0, 50) + '...'
    });

    admin.initializeApp({
      credential: admin.credential.cert(credential),
    });
    console.log('[Firebase Admin] Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('[Firebase Admin] Failed to initialize Firebase Admin SDK:', error.message);
    console.error('[Firebase Admin] Error details:', error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

const db = admin.firestore();
const messaging = admin.messaging();
const auth = admin.auth();
export { db, messaging,auth };