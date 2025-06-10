'use client';

import { useState } from 'react';

export default function WaiterFormPage() {
  const [formData, setFormData] = useState({
    fcmToken: 'fcmToken00',
    id: '',
    name: '',
    surname: '',
    sex: '',
    age: '',
    nationality: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value >= 0 ? value : '') : value,
    }));
  };

  const handleSubmit = async () => {
    const { fcmToken, id, name, surname, sex, age, nationality, email, phone } = formData;

    // Validate required fields
    if (!fcmToken || !id || !name || !surname || !sex || !age || !nationality || !email || !phone) {
      setMessage('Please fill all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Validate phone format (basic check for digits and optional +)
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phone)) {
      setMessage('Please enter a valid phone number (7-15 digits, optional +).');
      return;
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      setMessage('Please enter a valid age between 16 and 100.');
      return;
    }

    const requestBody = {
      fcmToken,
      id,
      name,
      surname,
      sex,
      age: ageNum,
      nationality,
      email,
      phone,
    };

    console.log('Sending waiter creation request:', requestBody);

    try {
      const response = await fetch('/api/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Waiter added successfully'); // Added alert box
        setMessage(`Waiter created with ID: ${data.waiterId}`);
        setFormData({
          fcmToken: 'fcmToken00',
          id: '',
          name: '',
          surname: '',
          sex: '',
          age: '',
          nationality: '',
          email: '',
          phone: '',
        });
      } else {
        setMessage(`Failed to create waiter: ${data.error || 'Unknown error'}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setMessage('Error creating waiter: Network or server issue');
      console.error('Fetch Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#ea176b]">Create New Waiter</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            FCM Token
          </label>
          <input
            type="text"
            name="fcmToken"
            value={formData.fcmToken}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Waiter ID
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Surname
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Sex
          </label>
          <div className="mt-1 flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="sex-male"
                name="sex"
                value="Male"
                checked={formData.sex === 'Male'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="sex-male" className="text-sm font-semibold text-[#104845]">
                Male
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sex-female"
                name="sex"
                value="Female"
                checked={formData.sex === 'Female'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="sex-female" className="text-sm font-semibold text-[#104845]">
                Female
              </label>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="16"
            max="100"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium font-semibold text-[#104845] tracking-[-.01em]">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <button
          className="w-full bg-foreground text-background rounded-full h-10 px-4 font-medium text-sm hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          onClick={handleSubmit}
        >
          Create Waiter
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