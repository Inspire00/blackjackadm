'use client'; // This directive makes this a client component

import { useState, useEffect } from 'react';
import BookingForm from '../BookingForm'; // Ensure BookingForm is also a client component

export default function Home() {
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        console.log('[Home] Attempting to fetch waiters from /api/waiters');
        const response = await fetch('/api/waiters');

        if (!response.ok) {
          const errorText = await response.text(); // Get raw error text for debugging
          console.error(`[Home] HTTP error! Status: ${response.status}, Details: ${errorText}`);
          throw new Error(`Failed to fetch waiters: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Home] Successfully fetched waiters data:', data);

        // Ensure data.waiters is an array, default to empty if not
        if (data && Array.isArray(data.waiters)) {
          setWaiters(data.waiters);
        } else {
          console.warn('[Home] Fetched data.waiters is not an array or is missing:', data);
          setWaiters([]); // Set to empty array if data is not as expected
        }

      } catch (err) {
        console.error('[Home] Error fetching waiters:', err);
        setError(`Failed to load waiters: ${err.message}`);
      } finally {
        setLoading(false); // Always set loading to false after fetch attempt
      }
    };

    fetchWaiters();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading waiters list... 🔄</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-600">Error: {error} ❌</p>
        <p className="text-sm text-gray-500 mt-2">Please check your Vercel logs for `/api/waiters`.</p>
      </div>
    );
  }

  // If no waiters are loaded and there's no error, display a message
  if (waiters.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">No waiters found. Please add some! 🤷‍♂️</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
        <h1 className="text-xl font-semibold mb-4 text-[#ea176b] tracking-[-.01em]">Booking System</h1>
        {/* Pass fetched waiters data to BookingForm */}
        <BookingForm waiters={waiters} />
      </div>
    </div>
  );
}
