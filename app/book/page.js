'use client'; // This directive makes this a client component

import { useState, useEffect } from 'react';
import BookingForm from '../BookingForm'; // Assuming BookingForm is also a client component or handles its own data fetching

export default function Home() {
  const [waiters, setWaiters] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch waiters
    const fetchWaiters = async () => {
      try {
        // Fetch from your existing API route that successfully fetches all waiters
        const response = await fetch('/api/waiters'); // Assuming you have a /api/waiters endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWaiters(data.waiters || []);
      } catch (err) {
        console.error('Error fetching waiters:', err);
        setError('Failed to load waiters.');
      }
    };

    // Function to fetch events (if needed, otherwise remove)
    const fetchEvents = async () => {
      try {
        // Assuming you have a /api/events endpoint or similar
        const response = await fetch('/api/events'); // You might need to create this API route if it doesn't exist
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events.');
      }
    };

    // Call both fetch functions
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchWaiters(), fetchEvents()]);
      setLoading(false);
    };

    loadData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading data...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
        <h1 className="text-xl font-semibold mb-4 text-[#ea176b] tracking-[-.01em]">Booking System</h1>
        {/* Pass fetched data to BookingForm */}
        <BookingForm waiters={waiters} events={events} />
      </div>
    </div>
  );
}
