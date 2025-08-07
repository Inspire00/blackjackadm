import admin from 'firebase-admin';

// Declare a variable to hold the initialized Firebase app instance.
// This will be used to ensure the app is only initialized once.
let app;

// Declare variables for Firestore, Messaging, and Auth instances.
let db;
let messaging;
let auth;

// Check if the Firebase app has already been initialized.
// This is the core of the singleton pattern.
if (!admin.apps.length) {
    // Log environment loading for debugging purposes.
    console.log('[Firebase Admin] Loading environment variables...');

    // Validate environment variables before attempting to initialize.
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`[Firebase Admin] Missing environment variable: ${envVar}`);
            // Throw an error to halt execution if critical environment variables are missing.
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    }

    // Log environment variable values for debugging (consider removing in production for security).
    console.log('[Firebase Admin] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('[Firebase Admin] FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.slice(0, 50) + '...' : 'undefined');
    console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 'undefined');

    // Perform a basic format check on the private key.
    if (!process.env.FIREBASE_PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.error('[Firebase Admin] FIREBASE_PRIVATE_KEY does not start with -----BEGIN PRIVATE KEY-----');
        throw new Error('Invalid FIREBASE_PRIVATE_KEY format: Missing start header');
    }
    if (!process.env.FIREBASE_PRIVATE_KEY.endsWith('-----END PRIVATE KEY-----\n')) {
        console.error('[Firebase Admin] FIREBASE_PRIVATE_KEY does not end with -----END PRIVATE KEY-----');
        throw new Error('Invalid FIREBASE_PRIVATE_KEY format: Missing end header or newline');
    }

    try {
        // Construct the credential object.
        // The private key needs its escaped newlines replaced with actual newlines.
        const credential = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        console.log('[Firebase Admin] Parsed privateKey (first 50 chars):', credential.privateKey.slice(0, 50) + '...');
        console.log('[Firebase Admin] Attempting to initialize with credential:', {
            projectId: credential.projectId,
            clientEmail: credential.clientEmail,
            privateKey: credential.privateKey.slice(0, 50) + '...' // Masking for logging
        });

        // Initialize the Firebase Admin SDK.
        app = admin.initializeApp({
            credential: admin.credential.cert(credential),
        });
        console.log('[Firebase Admin] Firebase Admin SDK initialized successfully');

        // Assign the Firestore, Messaging, and Auth instances from the initialized app.
        db = app.firestore();
        messaging = app.messaging();
        auth = app.auth();

    } catch (error) {
        console.error('[Firebase Admin] Failed to initialize Firebase Admin SDK:', error.message);
        console.error('[Firebase Admin] Error details:', error);
        // Re-throw the error to ensure the application fails fast if initialization fails.
        throw new Error(`Firebase initialization failed: ${error.message}`);
    }
} else {
    // If the app is already initialized (e.g., during hot-reloading in development),
    // get the existing app instance and its services.
    app = admin.app(); // Get the default app
    db = app.firestore();
    messaging = app.messaging();
    auth = app.auth();
    console.log('[Firebase Admin] Firebase Admin SDK already initialized, reusing existing instance.');
}

// Export the initialized instances for use throughout your application.
export { db, messaging, auth };
