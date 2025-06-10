'use client';

import { useState, useEffect } from 'react';

export default function EventReportForm() {
  const [formData, setFormData] = useState({
    date: '',
    client_name: '',
    company_name: '',
    location: '',
    head_waiter: '',
    total_waiters: '',
    start_time: '',
    end_time: '',
    event_duration: '',
    waiters: [],
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [availableWaiters, setAvailableWaiters] = useState([]);
  const [loadingWaiters, setLoadingWaiters] = useState(true);
  const [errorLoadingWaiters, setErrorLoadingWaiters] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const response = await fetch('/api/waiters', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAvailableWaiters(data.waiters || []);
        setLoadingWaiters(false);
      } catch (error) {
        console.error('Error fetching waiters:', error);
        setErrorLoadingWaiters('Failed to load waiters.');
        setLoadingWaiters(false);
      }
    };

    fetchWaiters();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_waiters' || name === 'event_duration'
        ? (value >= 0 ? value : '')
        : value,
    }));
  };

  const handleWaiterCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedWaiters = checked
        ? [...prev.waiters, value]
        : prev.waiters.filter((waiterId) => waiterId !== value);
      return { ...prev, waiters: updatedWaiters };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
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
    } = formData;

    if (!date || !client_name || !company_name || !location || !head_waiter || !total_waiters || !start_time || !end_time || !event_duration) {
      setMessage('Please fill all required event details.');
      setIsSubmitting(false);
      return;
    }

    const totalWaitersNum = parseInt(total_waiters);
    const eventDurationNum = parseInt(event_duration);

    if (isNaN(totalWaitersNum) || totalWaitersNum <= 0) {
      setMessage('Total waiters must be a number greater than zero.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(eventDurationNum) || eventDurationNum <= 0) {
      setMessage('Event duration must be a number greater than zero.');
      setIsSubmitting(false);
      return;
    }

    const requestBody = {
      date,
      client_name,
      company_name,
      location,
      head_waiter,
      total_waiters: totalWaitersNum,
      start_time,
      end_time,
      event_duration: eventDurationNum,
      waiters,
      notes,
    };

    console.log('Sending event report creation request:', requestBody);

    try {
      // Corrected endpoint:  Use '/api/event-report'  (or '/api/event-report/route.js' in new Next.js)
      const response = await fetch('/api/event-report', {  //  <---  Corrected URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Event report created with ID: ${data.eventReportId}`);
        setFormData({
          date: '',
          client_name: '',
          company_name: '',
          location: '',
          head_waiter: '',
          total_waiters: '',
          start_time: '',
          end_time: '',
          event_duration: '',
          waiters: [],
          notes: '',
        });
      } else {
        setMessage(`Failed to create event report: ${data.error || 'Unknown error'}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setMessage('Error creating event report: Network or server issue');
      console.error('Fetch Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
        <h2 className="text-xl font-semibold mb-4 text-[#ea176b] tracking-[-.01em]">Create Event Report</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Client Name
          </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium  font-semibold text-[#104845] tracking-[-.01em]">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
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
            Head Waiter
          </label>
          <input
            type="text"
            name="head_waiter"
            value={formData.head_waiter}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Total Waiters
          </label>
          <input
            type="number"
            name="total_waiters"
            value={formData.total_waiters}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Start Time
          </label>
          <input
            type="time"  // Changed to type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium  font-semibold text-[#104845] tracking-[-.01em]">
            End Time
          </label>
          <input
            type="time"  // Changed to type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Event Duration (minutes)
          </label>
          <input
            type="number"
            name="event_duration"
            value={formData.event_duration}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Waiters
          </label>
          {loadingWaiters ? (
            <p>Loading waiters...</p>
          ) : errorLoadingWaiters ? (
            <p className="text-red-500">{errorLoadingWaiters}</p>
          ) : (
            <div className="mt-2 border border-gray-300 rounded-md p-2">
              {availableWaiters.map((waiter) => (
                <div key={waiter.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`waiter-${waiter.id}`}
                    value={waiter.id}
                    checked={formData.waiters.includes(waiter.id)}
                    onChange={handleWaiterCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor={`waiter-${waiter.id}`} className="text-sm text-[#104845]">
                    {waiter.name} {waiter.surname} ({waiter.id})
                  </label>
                </div>
              ))}
              {availableWaiters.length === 0 && <p className="text-sm text-gray-500">No waiters available.</p>}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium  font-semibold text-[#104845] tracking-[-.01em]">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <button
          className="w-full bg-foreground text-background rounded-full h-10 px-4 font-medium text-sm hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Event Report...' : 'Create Event Report'}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600 tracking-[-.01em]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
