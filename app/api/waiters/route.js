import admin from 'firebase-admin';
import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    console.log('[Waiters API] Received GET request for all waiters.');
    const waitersSnapshot = await db.collection('waiters').orderBy('name').get();
    const waiters = [];
    waitersSnapshot.forEach((doc) => {
      waiters.push({ id: doc.id, ...doc.data() });
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
