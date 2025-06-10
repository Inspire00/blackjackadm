const admin = require('firebase-admin');

console.log('[Test Credentials] Loading environment variables...');
console.log('[Test Credentials] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('[Test Credentials] FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('[Test Credentials] FIREBASE_PRIVATE_KEY (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.slice(0, 50) + '...' : 'undefined');

try {
  const credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  console.log('[Test Credentials] Parsed credential:', {
    projectId: credential.projectId,
    clientEmail: credential.clientEmail,
    privateKey: credential.privateKey.slice(0, 50) + '...'
  });

  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });
  console.log('[Test Credentials] Firebase Admin SDK initialized successfully');

  const db = admin.firestore();
  db.collection('waiters').get()
    .then((snapshot) => {
      console.log('[Test Credentials] Waiters collection:', snapshot.docs.map(doc => doc.id));
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Test Credentials] Error querying waiters:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('[Test Credentials] Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}