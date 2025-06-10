import admin from 'firebase-admin';
import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const {
      date,
      client_name,
      company_name,
      location,
      head_waiter,
      total_waiters,
      start_time,
      end_time,
      event_duration,
      waiters,
      notes,
    } = await req.json();
    console.log('[Event Reports API] Received request with event report data:', {
      date,
      client_name,
      company_name,
      location,
      head_waiter,
      total_waiters,
      start_time,
      end_time,
      event_duration,
      waiters,
      notes,
    });

    if (
      !date ||
      !client_name ||
      !company_name ||
      !location ||
      !head_waiter ||
      total_waiters === undefined ||
      start_time === undefined ||
      end_time === undefined ||
      event_duration === undefined
    ) {
      return NextResponse.json(
        { error: 'Please provide all required event report fields.' },
        { status: 400 }
      );
    }

    const totalWaitersNum = parseInt(total_waiters);
    const eventDurationNum = parseInt(event_duration);

    if (isNaN(totalWaitersNum) || totalWaitersNum <= 0) {
      return NextResponse.json(
        { error: 'Total waiters must be a number greater than zero.' },
        { status: 400 }
      );
    }

    if (isNaN(eventDurationNum) || eventDurationNum <= 0) {
      return NextResponse.json(
        { error: 'Event duration must be a number greater than zero.' },
        { status: 400 }
      );
    }

    const eventReportData = {
      date,
      client_name,
      company_name,
      location,
      head_waiter,
      total_waiters: totalWaitersNum,
      start_time,
      end_time,
      event_duration: eventDurationNum,
      waiters: waiters || [], // Ensure waiters is an array
      notes: notes || '',     // Ensure notes is a string
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('event_reports').add(eventReportData);
    console.log('[Event Reports API] Event report created with ID:', docRef.id);

    return NextResponse.json({ eventReportId: docRef.id });
  } catch (error) {
    console.error('[Event Reports API] Error creating event report:', error);
    return NextResponse.json(
      { error: 'Failed to create event report: ' + error.message },
      { status: 500 }
    );
  }
}
