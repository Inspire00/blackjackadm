// For Next.js App Router (app/api/waiters/route.js)
// If you are using Pages Router, this would be in pages/api/waiters.js
import { db } from '../../lib/firebaseAdmin'; // Adjust path as necessary based on your file structure
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[Waiters API] Received GET request for all waiters.');
    // Removed .orderBy('name') to test if it resolves the blank page issue.
    // This often requires a Firestore index, which might be missing on Vercel.
    const waitersSnapshot = await db.collection('waiters').get();
    const waiters = [];
    waitersSnapshot.forEach((doc) => {
      const data = doc.data();
      waiters.push({
        id: doc.id,
        email: data.email || null,
        name: data.name || doc.id, // Fallback to ID if name is missing
        fcmToken: data.fcmToken || null,
        surname: data.surname || null,
        sex: data.sex || null,
        age: data.age || null,
        nationality: data.nationality || null,
        phone: data.phone || null,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        // Add any other fields you need from the waiter document
      });
    });
    console.log('[Waiters API] Fetched', waiters.length, 'waiters.');
    return NextResponse.json({ waiters });
  } catch (error) {
    console.error('[Waiters API] Error fetching waiters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waiters: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { fcmToken, id, name, surname, sex, age, nationality, email, phone } = await req.json();
    console.log('[Waiters API] Received request with waiter data:', { id, name, surname });

    // Check if waiter ID already exists
    const existingWaiter = await db.collection('waiters').doc(id).get();
    if (existingWaiter.exists) {
      return NextResponse.json(
        { error: `Waiter with ID ${id} already exists`, waiterId: null },
        { status: 400 }
      );
    }

    // Create new waiter document
    const waiterData = {
      fcmToken,
      id,
      name,
      surname,
      sex,
      age,
      nationality,
      email,
      phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('waiters').doc(id).set(waiterData);
    console.log('[Waiters API] Waiter created with ID:', id);

    return NextResponse.json({ waiterId: id });
  } catch (error) {
    console.error('[Waiters API] Error creating waiter:', error);
    return NextResponse.json(
      { error: 'Failed to create waiter: ' + error.message },
      { status: 500 }
    );
  }
}
