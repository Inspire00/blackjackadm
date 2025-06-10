import admin from 'firebase-admin';
import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';



async function getAccessToken() {
  try {
    const jwtClient = new google.auth.JWT(
      process.env.FIREBASE_CLIENT_EMAIL,
      null,
      process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newlines
      ['https://www.googleapis.com/auth/firebase.messaging']
    );
    const token = await jwtClient.authorize();
    return token.access_token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
}

export async function POST(req) {
  try {
    const { event, waiterIds } = await req.json();
    console.log('[Bookings API] Received request with event:', event, 'waiterIds:', waiterIds);

    // Generate a unique eventId for this booking group
    const eventId = db.collection('bookings').doc().id;
    console.log('[Bookings API] Generated eventId:', eventId);

    // Fetch all waiter details to get names
    const waiterDetails = [];
    for (const waiterId of waiterIds) {
      console.log('[Bookings API] Fetching waiter with ID:', waiterId);
      const waiterDoc = await db.collection('waiters').doc(waiterId).get();
      if (waiterDoc.exists) {
        const waiter = waiterDoc.data();
        waiterDetails.push({ id: waiterId, name: waiter.name || waiterId, fcmToken: waiter.fcmToken });
      } else {
        console.warn('[Bookings API] Waiter not found for ID:', waiterId);
      }
    }

    if (waiterDetails.length === 0) {
      return NextResponse.json(
        { error: 'No valid waiters found', bookingId: null },
        { status: 400 }
      );
    }

    // Prepare arrays for all waiter IDs and names
    const allWaiterIds = waiterDetails.map((w) => w.id);
    const allWaiterNames = waiterDetails.map((w) => w.name);

    const bookingIds = [];

    // Create bookings for each waiter with event details and waiter name
    for (const waiter of waiterDetails) {
      console.log('[Bookings API] Processing waiter:', waiter.id);
      const waiterDoc = await db.collection('waiters').doc(waiter.id).get();
      const waiterData = waiterDoc.data();

      if (!waiterData || !waiterData.fcmToken) {
        console.warn('[Bookings API] No valid FCM token for waiterId:', waiter.id);
        continue; // Skip this waiter, but continue with others
      }

      const bookingRef = await db.collection('bookings').add({
        eventId,
        waiterId: waiter.id,
        waiterName: waiter.name,
        allWaiterIds,
        allWaiterNames,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        event: {
          date: event.date,
          clientName: event.clientName,
          companyName: event.companyName,
          location: event.location,
          waitersNum: parseInt(event.waitersNum),
          pickUpTime: event.pickUpTime,
          notes: event.notes || '',
        },
      });
      console.log('[Bookings API] Booking created with ID:', bookingRef.id);
      bookingIds.push(bookingRef.id);

      // Send FCM notification
      let accessToken;
      try {
        accessToken = await getAccessToken();
        console.log('[Bookings API] Access token generated successfully');
      } catch (tokenError) {
        console.error('[Bookings API] Failed to generate access token:', tokenError.message);
        continue;
      }

      const sentTime = Date.now();
      const message = {
        message: {
          token: waiterData.fcmToken,
          data: {
            bookingId: bookingRef.id,
            eventId,
            action: 'accept_decline',
            sentTime: sentTime.toString(),
          },
          notification: {
            title: 'New Booking Request',
            body: `You have been booked for ${event.companyName || 'an event'} on ${event.date || 'a date'} at ${event.location || 'a location'} go to app for more details.`,
          },
          android: {
            priority: 'high',
            notification: { channelId: 'booking_notifications', clickAction: 'OPEN_ACTIVITY' },
          },
          apns: {
            payload: {
              aps: { category: 'BOOKING_REQUEST', contentAvailable: true, mutableContent: 1 },
              'custom-data': { bookingId: bookingRef.id, eventId, action: 'accept_decline' },
            },
            fcmOptions: { analyticsLabel: 'booking_request' },
          },
        },
      };

      try {
        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/blackjack-8d304/messages:send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(message),
          }
        );

        const data = await response.json();
        console.log('[Bookings API] FCM response:', data);

        if (!response.ok) {
          console.error('[Bookings API] FCM notification failed:', data.error || data);
        } else {
          console.log('[Bookings API] Notification sent to waiter:', waiter.id);
        }
      } catch (fcmError) {
        console.error('[Bookings API] FCM notification failed:', fcmError.message);
      }
    }

    return NextResponse.json({ bookingId: bookingIds[0], eventId });
  } catch (error) {
    console.error('[Bookings API] Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking: ' + error.message },
      { status: 500 }
    );
  }
}