import { db } from '../lib/firebaseAdmin';
import BookingForm from '../BookingForm';

export default async function Home() {
  const waitersSnapshot = await db.collection('waiters').get();
  const eventsSnapshot = await db.collection('events').get();

  const waiters = waitersSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      fcmToken: data.fcmToken,
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    };
  });

  const events = eventsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      eventId: data.eventId || doc.id, // Use eventId if renamed, fallback to doc.id
      name: data.name,
      date: data.date,
      location: data.location,
    };
  });

  return (
    <div>
      <h1>Booking System</h1>
      <BookingForm waiters={waiters} events={events} />
    </div>
  );
}