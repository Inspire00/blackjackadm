import { NextResponse } from 'next/server';
import { db } from '../../lib/firebaseAdmin';

/**
 * API route to fetch steps statistics for a specific role
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  console.log('[API] Received GET request for /api/steps-stats');
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!role || !startDate || !endDate) {
    console.error('[API] Missing role, startDate, or endDate');
    return NextResponse.json({ error: 'Role, start and end dates are required' }, { status: 400 });
  }

  try {
    // Verify db is a Firestore instance
    if (!db || typeof db.collection !== 'function') {
      console.error('[API] Invalid Firestore instance:', db);
      throw new Error('Firestore instance is not properly initialized');
    }

    console.log(`[API] Fetching ${role} from Firestore`);
    const staffSnapshot = await db.collection(role.toLowerCase()).get();
    const staff = staffSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`[API] Fetched ${role}:`, staff.length);

    console.log(`[API] Fetching ${role}_steps from Firestore`);
    const stepsSnapshot = await db
      .collection(`${role.toLowerCase()}_steps`)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
    const stepsData = stepsSnapshot.docs.map((doc) => doc.data());
    console.log(`[API] Fetched ${role}_steps:`, stepsData.length);

    console.log(`[API] Calculating stats for ${role}`);
    const staffStats = staff.map((member) => {
      const relevantSteps = stepsData.filter((step) => step.waiterId === member.email);
      const totalSteps = relevantSteps.reduce((sum, step) => sum + (step.counted_steps || 0), 0);
      const totalEvents = relevantSteps.length;

      return {
        staff: {
          id: member.id,
          name: member.name || 'Unknown',
          surname: member.surname || '',
          email: member.email || 'N/A',
          phone: member.phone || 'N/A',
        },
        totalSteps,
        totalEvents,
      };
    });

    console.log(`[API] Returning ${role}Stats:`, staffStats.length);
    return NextResponse.json({ staffStats });
  } catch (error) {
    console.error(`[API] Error fetching ${role} stats:`, error);
    return NextResponse.json({ error: `Failed to fetch stats: ${error.message}` }, { status: 500 });
  }
}