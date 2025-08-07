'use client';

import { useState, useEffect } from 'react';

export default function BookingForm({ waiters }) {
  // Initialize showWaiters to true for debugging purposes, so the list is always attempted to be shown
  const [showWaiters, setShowWaiters] = useState(true); // Keeping true for now, can revert later
  const [formData, setFormData] = useState({
    date: '',
    clientName: '',
    companyName: '',
    location: '',
    waitersNum: '',
    pickUpTime: '',
    notes: '',
    selectedWaiters: [],
  });
  const [message, setMessage] = useState('');

  // Add a useEffect to log the waiters prop whenever it changes
  useEffect(() => {
    console.log('[BookingForm useEffect] Waiters prop updated:', waiters);
    if (!waiters || waiters.length === 0) {
      console.warn('[BookingForm useEffect] Waiters prop is empty or null/undefined.');
    }
  }, [waiters]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'waitersNum' ? (value >= 0 ? value : '') : value,
    }));
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD
    setFormData((prev) => ({ ...prev, date: formattedDate }));
  };

  const handleWaiterToggle = (waiterId) => {
    setFormData((prev) => {
      const selectedWaiters = prev.selectedWaiters.includes(waiterId)
        ? prev.selectedWaiters.filter((id) => id !== waiterId)
        : [...prev.selectedWaiters, waiterId];
      return { ...prev, selectedWaiters };
    });
  };

  const handleBooking = async () => {
    const { date, clientName, companyName, location, waitersNum, pickUpTime, notes, selectedWaiters } = formData;

    if (!date || !clientName || !companyName || !location || !waitersNum || !pickUpTime || selectedWaiters.length === 0) {
      setMessage('Please fill all required fields and select at least one waiter.');
      return;
    }

    if (parseInt(waitersNum) < selectedWaiters.length) {
      setMessage('Selected waiters cannot exceed the number of waiters specified.');
      return;
    }

    const requestBody = {
      event: { date, clientName, companyName, location, waitersNum, pickUpTime, notes },
      waiterIds: selectedWaiters,
    };

    console.log('Sending booking request:', requestBody);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Booking created with ID: ${data.bookingId}`);
        setFormData({
          date: '',
          clientName: '',
          companyName: '',
          location: '',
          waitersNum: '',
          pickUpTime: '',
          notes: '',
          selectedWaiters: [],
        });
        setShowWaiters(false);
      } else {
        setMessage(`Failed to create booking: ${data.error || 'Unknown error'}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setMessage('Error creating booking: Network or server issue');
      console.error('Fetch Error:', error);
    }
  };

  return (
    // Removed ml-100 and added mx-auto for centering, and relative for potential z-index context
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4 text-[#ea176b] tracking-[-.01em]">Create Booking</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Event Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleDateChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Client Name
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Number of Waiters
        </label>
        <input
          type="number"
          name="waitersNum"
          value={formData.waitersNum}
          onChange={handleInputChange}
          min="0"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Pick Up Time
        </label>
        <input
          type="time"
          name="pickUpTime"
          value={formData.pickUpTime}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mb-4">
        {/* The button now just toggles, but showWaiters is initially true for debugging */}
        <button
          className="w-full bg-[#b4f6cb] text-gray-800 rounded-full h-10 px-4 font-medium text-sm hover:bg-gray-300 transition-colors"
          onClick={() => setShowWaiters(!showWaiters)}
        >
          {showWaiters ? 'Hide Waiters' : 'Select Waiters'}
        </button>
        {showWaiters && (
          // Added z-10 for layering, ensuring it's above other elements if there's a conflict
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 z-10">
            {console.log('[BookingForm Render] Waiters array before map:', waiters)}
            {Array.isArray(waiters) && waiters.length > 0 ? (
              waiters.map((waiter) => (
                <div key={waiter.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`waiter-${waiter.id}`}
                    checked={formData.selectedWaiters.includes(waiter.id)}
                    onChange={() => handleWaiterToggle(waiter.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`waiter-${waiter.id}`} className="text-sm text-[#104845]">
                    {waiter.name || waiter.id}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No waiters available to select.</p>
            )}
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="5"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <button
        className="w-full bg-foreground text-background rounded-full h-10 px-4 font-medium text-sm hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
        onClick={handleBooking}
      >
        Create Booking
      </button>
      {message && (
        <p className="mt-4 text-center text-sm text-gray-600 tracking-[-.01em]">
          {message}
        </p>
      )}
    </div>
  );
}
