"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Starting auth check for path:", pathname);
    console.log("Firebase auth object:", auth);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state resolved:", currentUser ? "Logged in" : "Not logged in");
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error("Auth callback error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [pathname]);

  if (loading) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  if (error) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-white text-center">
            <p>Error: {error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            >
              Go to Login
            </button>
          </div>
        </body>
      </html>
    );
  }

  if (!user && pathname !== '/') {
    console.log("No user, redirecting to / from:", pathname);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return (
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">Redirecting to login...</p>
          </div>
        </body>
      </html>
    );
  }

  if (!user && pathname === '/') {
    console.log("No user, on /, rendering login page");
    return (
      <html lang="en">
        <body className={`${inter.variable}`}>
          {children}
        </body>
      </html>
    );
  }

  console.log("Rendering protected layout for user:", user?.uid);
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">{children}</main>
      </body>
    </html>
  );
}

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
   
    { path: '/book', name: 'BookStaff' },
    { path: '/event-report', name: 'EventReport' },
    { path: '/dashboard', name: 'StaffAccounts' },
    { path: '/staffsteps', name: 'StaffStepsStats' },
    { path: '/waiters', name: 'AddStaff' },
  ];

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[#b4f6cb]">BlackJack Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-[#b4f6cb] text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-pink-400'
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => auth.signOut().then(() => router.push('/'))}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-pink-400 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}