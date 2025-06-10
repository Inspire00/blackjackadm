import admin from 'firebase-admin';
import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Service account credentials (unchanged)
const serviceAccount = {
  client_email: "firebase-adminsdk-fbsvc@blackjack-8d304.iam.gserviceaccount.com",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFenuRhfbPwEkB
LflCpjWqC/EbZodQn3prOsWaM0R9oMUSFHLNyxU4yiW1BwQrIHTiC6Q/It04Kjoc
knSBKCfU1+ON3Ee3LZxF03ojQ+lCnMdsFCq4hhYVMHuUMTVceeICVXYCsniALLZK
VaxGnAqhL+lf1IzRb2sd++SWEI5rYpu9gM/2a3ydb2FOrfmobIxxQkW1yoG/ZP6A
Fwv8CfSbknQirK9v1jEiQMXp9O+dlRpIxuO6RuIaJKRp/uMwFi8iR9umv3E35Omw
q/GNmLx0/KSEHKJr5Azssjtad4LCTNkrBpRn/vuZvnEtyPFb4rbt5c5+ZyFnaIIt
C6H+f7EXAgMBAAECggEAEIhMuGxW5lU6h2iNTQDtmzSjiCy3a8HklZeQNXTQ6UeN
WBJYLiLJvj0slpD/NPEWd/O+wDGWA/62nYlXsZYAB6sI3oNJ8B7xNBm2FVlSubeD
k0746J8CuEScnYjYTWUMZvxqncn9M2KkfDXbiPaSH6TYMwqjVpR78XQS7GR3pKux
MJBJHh5DTt/JNj1IiZU2Lmd+3m3m8Xtr2EZfQz5jcXvj4mAoEZ+k0akCwm01akp+
+jsm6CvRaWrLqp1hylMDF+DLibNhBRVygoWE4fuJXRlLsY9weSV3ilqKUq2whqKd
HSumJsm4bqWVZkgm7nSkJqaixpr+LfNgtdV9My/lGQKBgQDu9mCnwBlj/VLtBcUr
C4VEY6wZGwPxkB4XgNmoaw+Vl3cgOkRlnNXskesYSUNwDcSSzOs/TvyuKE28xVXX
oHu37lwzKBEvhpZ+tCFTM7yAlDNqZQD3wu7VwhKJzOQ7ddDpsrgbP36/e6kDz3y+
HscSACZsCZuIJicMdDVduZnGAwKBgQDTju0Dzv2C488lNw2c5jBLm5XfSNpWsSiy
2KbjXW02wVJsolUxgaQTpDqPHGNhLpmImQOOsFlP2sLzEv9iCxnFBEcGfWf2svk8
v62OhP24EHpt8EPzWKRCAlWkVpnWrSyK6TIDzKdaWEa3PGzl88B0Dbp3KWB/e6gB
I5MOqd+WXQKBgFR+b3zBMvklCJ5gjPAEedHNwHt8Du/qOomq+MtRV8hYLzoJAEhB
pW6pxcvnk93aMGiL5p6TCkt2Ws5lpE3DJBvMP3OjNjhsyWfxv1rRD1UTkf6LykTQ
+2w/3Bg3h3fy17TaibiwwdtpGUEMq5n5/f/CZ9OJriH9A4+mw3vpdZMLAoGBAL3W
KuiX/PRO57pFRHneNMgjvMC35vST1CloL5kmZLIVl5jTsg7SfiEB5Wo11xeFcVAZ
vg90PzBg5T6pdXDM9TrNM86nCXtd7jiM53hT7jgU0UeFqfPbPsncvmzRKQpyKt4b
kz3FjwaK4CnclvthVvjMuN3kyyqaE4+yFGu8E14hAoGBAOkuwcMjhLS7Hvyx/bIr
ZwArAYZ7Sd68EDgdMr+8Se2iDsyW90BGTN2RXzBWaIrJQc/jO+dHLBaBGBSngLeu
cvdD1w4e0AmBewPh3JJE3UNYvJ/eoFkTJTDQkKduAZc5jbvY50D2B1ci1p2P/0u2
PXLhFcxT5XgbCMOTLPxdLtzd
-----END PRIVATE KEY-----`,
};

async function getAccessToken() {
  try {
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
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