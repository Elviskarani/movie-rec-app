'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-700 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center text-white max-w-4xl mx-auto px-4">
        {/* App Title */}
        <h1 className="text-6xl font-bold mb-8">Spotlight</h1>
        
        {/* Movie Posters Section */}
        <div className="mb-8">
          {/* Floating element (you can replace with your own image/icon) */}
          <div className="mb-6 flex justify-center">
          </div>
          
          {/* Movie Posters Container */}
          <div className="flex justify-center items-center mb-8 space-x-4 perspective-1000">
            {/* Placeholder for your movie posters - replace src with your actual images */}
            <div className="transform -rotate-12 hover:rotate-0 transition-transform duration-300">
              <img 
                src="/superman.webp" 
                alt="Movie 1"
                className="w-32 h-48 md:w-40 md:h-60 rounded-lg shadow-2xl object-cover"
              />
            </div>
            <div className="transform rotate-6 hover:rotate-0 transition-transform duration-300 z-10">
              <img 
                src="/jurassicworld.webp" 
                alt="Movie 2"
                className="w-36 h-52 md:w-44 md:h-64 rounded-lg shadow-2xl object-cover"
              />
            </div>
            <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <img 
                src="/arrival.webp" 
                alt="Movie 3"
                className="w-32 h-48 md:w-40 md:h-60 rounded-lg shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Main Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Find Movies You'll Enjoy<br />
          Without The Hassle.
        </h2>
        
        {/* Subtitle */}
        <p className="text-xl mb-8 text-blue-100">
          Discover your next favorite movie
        </p>
        
        {/* Action Buttons */}
        <div className="space-x-4">
          <Link 
            href="/login"
            className="bg-gray-600 hover:bg-black px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="bg-gray-600 hover:bg-black px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}