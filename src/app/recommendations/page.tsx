'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Movie, UserPreferences } from '@/lib/types';
import { getStorageItem } from '@/lib/storage';
import { getMovieRecommendations } from '@/lib/tmdb';
import Image from 'next/image';

const TMDB_IMG_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = process.env.NEXT_PUBLIC_TMDB_BACKDROP_BASE_URL || 'https://image.tmdb.org/t/p/w1280';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>([]);
  const [usedMovieIds, setUsedMovieIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [gettingNext, setGettingNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Get user preferences from localStorage
    const savedPreferences = getStorageItem<UserPreferences>('userPreferences');
    if (!savedPreferences) {
      router.push('/preferences');
      return;
    }

    setPreferences(savedPreferences);
    loadInitialRecommendations(savedPreferences);
  }, [user, router]);

  const loadInitialRecommendations = async (userPreferences: UserPreferences) => {
    setLoading(true);
    try {
      const movies = await getMovieRecommendations(userPreferences);
      if (movies.length > 0) {
        setAvailableMovies(movies);
        const firstMovie = movies[0];
        setCurrentMovie(firstMovie);
        setUsedMovieIds(new Set([firstMovie.id]));
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
    setLoading(false);
  };

  const loadMoreRecommendations = async () => {
    if (!preferences) return;
    
    try {
      const nextPage = currentPage + 1;
      const newPreferences = { ...preferences, page: nextPage };
      const newMovies = await getMovieRecommendations(newPreferences);
      
      if (newMovies.length > 0) {
        setAvailableMovies(prev => [...prev, ...newMovies]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more recommendations:', error);
    }
  };

  const getNextRecommendation = async () => {
    setGettingNext(true);
    
    // Find an unused movie from available movies
    const unusedMovies = availableMovies.filter(movie => !usedMovieIds.has(movie.id));
    
    if (unusedMovies.length > 0) {
      const nextMovie = unusedMovies[Math.floor(Math.random() * unusedMovies.length)];
      setCurrentMovie(nextMovie);
      setUsedMovieIds(prev => new Set([...prev, nextMovie.id]));
    } else {
      // Load more movies if we've used all available ones
      await loadMoreRecommendations();
      const newUnusedMovies = availableMovies.filter(movie => !usedMovieIds.has(movie.id));
      
      if (newUnusedMovies.length > 0) {
        const nextMovie = newUnusedMovies[Math.floor(Math.random() * newUnusedMovies.length)];
        setCurrentMovie(nextMovie);
        setUsedMovieIds(prev => new Set([...prev, nextMovie.id]));
      }
    }
    
    setGettingNext(false);
  };

  const resetPreferences = () => {
    router.push('/preferences');
  };

  const formatRating = (rating: number) => {
    return Math.round(rating * 10) / 10;
  };

  const formatReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Finding perfect movies for you...</p>
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-4">No recommendations found</h2>
          <p className="text-gray-400 mb-6">
            We couldn't find any movies matching your preferences. Try adjusting your preferences.
          </p>
          <button
            onClick={resetPreferences}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Update Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Movie Recommendation</h1>
          <p className="text-gray-400">
            Based on your preferences: {preferences?.mood && `${preferences.mood} mood`}
            {preferences?.watchingWith && ` • watching with ${preferences.watchingWith}`}
            {preferences?.genre && preferences.genre !== 'any' && ` • ${preferences.genre}`}
          </p>
        </div>

        {/* Movie Card */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="md:flex">
            {/* Movie Poster */}
            <div className="md:w-1/3">
              <div className="relative h-96 md:h-full">
                {currentMovie.poster_path ? (
                  <Image
                    src={`${TMDB_IMG_BASE}${currentMovie.poster_path}`}
                    alt={currentMovie.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <div className="text-gray-500 text-6xl">🎬</div>
                  </div>
                )}
              </div>
            </div>

            {/* Movie Details */}
            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentMovie.title}</h2>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>{formatReleaseYear(currentMovie.release_date)}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{formatRating(currentMovie.vote_average)}/10</span>
                    </div>
                    <span>({currentMovie.vote_count.toLocaleString()} votes)</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {currentMovie.overview || 'No overview available for this movie.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={getNextRecommendation}
                  disabled={gettingNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {gettingNext ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Finding Next Movie...
                    </span>
                  ) : (
                    'Get Another Recommendation'
                  )}
                </button>
                
                <button
                  onClick={resetPreferences}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Change Preferences
                </button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Movies shown: {usedMovieIds.size} • Total available: {availableMovies.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop Image (optional enhancement) */}
       
      </div>
    </div>
  );
}