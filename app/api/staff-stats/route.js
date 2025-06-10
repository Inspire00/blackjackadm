import { NextResponse } from 'next/server';
import { db } from '../../lib/firebaseAdmin';


/**
 * API route to fetch staff statistics
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
exports.GET = async function GET(request) {
  console.log('[API] Received GET request for /api/staff-stats');
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    console.error('[API] Missing startDate or endDate');
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
  }

  try {
    // Verify db is a Firestore instance
    if (!db || typeof db.collection !== 'function') {
      console.error('[API] Invalid Firestore instance:', db);
      throw new Error('Firestore instance is not properly initialized');
    }

    console.log('[API] Fetching waiters from Firestore');
    const waitersSnapshot = await db.collection('waiters').get();
    const waiters = waitersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('[API] Fetched waiters:', waiters.length);

    console.log('[API] Fetching event reports from Firestore');
    const eventReportsSnapshot = await db
      .collection('event_reports')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
    const eventReports = eventReportsSnapshot.docs.map((doc) => doc.data());
    console.log('[API] Fetched event reports:', eventReports.length);

    console.log('[API] Calculating stats for waiters');
    const waitersStats = waiters.map((waiter) => {
      const relevantReports = eventReports.filter((report) =>
        report.waiters?.includes(waiter.id)
      );
      const totalHours = relevantReports.reduce(
        (sum, report) => sum + (report.event_duration || 0),
        0
      );
      const totalEvents = relevantReports.length;

      return {
        waiter: {
          id: waiter.id,
          name: waiter.name || 'Unknown',
          surname: waiter.surname || '',
          email: waiter.email || 'N/A',
          phone: waiter.phone || 'N/A',
        },
        totalHours,
        totalEvents,
        hourlyRate: 0,
        grossEarnings: 0,
      };
    });

    console.log('[API] Returning waitersStats:', waitersStats.length);
    return NextResponse.json({ waitersStats });
  } catch (error) {
    console.error('[API] Error fetching staff stats:', error);
    return NextResponse.json({ error: `Failed to fetch stats: ${error.message}` }, { status: 500 });
  }
};