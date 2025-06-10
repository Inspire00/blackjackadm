"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { signInWithEmailAndPassword } from 'firebase/auth';


import Image from 'next/image';
import { auth } from './layout';

const AUTHORIZED_EMAILS = [
  
  'vinnyatsa2@gmail.com'
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      setError('Not Authorized User');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/book');
    } catch (error) {
      setLoading(false);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('User does not exist');
          break;
        case 'auth/wrong-password':
          setError('Invalid password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Login failed system offline: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-gray-950 border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#b4f6cb]">BlackJack Admin Login</h2>
        
        <div className="flex justify-center mb-6">
          <Image
            src="/images/blackhome.png" // Replace with your image path or URL
            alt="Login Illustration"
            width={150}
            height={150}
            className="rounded-full border-2 border-[#b4f6cb]"
          />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500"
              placeholder="Enter your password"
              pattern="[a-zA-Z0-9]+"
              title="Password must contain only letters and numbers"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black font-semibold bg-[#b4f6cb] hover:bg-[#104845] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}