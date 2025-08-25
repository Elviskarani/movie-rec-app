'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Movie, Genre, UserPreferences } from '@/lib/types';
import { getStorageItem } from '@/lib/storage';
import { 
  getMovieRecommendations, 
  searchMovies, 
  getPopularMovies, 
  getGenres 
} from '@/lib/tmdb';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import FilterPanel, { FilterState } from '@/components/FilterPanel';

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadInitialData();
  }, [user, router]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load genres
      const genresData = await getGenres();
      setGenres(genresData);
      
      // Check if user has preferences
      const savedPreferences = getStorageItem<UserPreferences>('userPreferences');
      setUserPreferences(savedPreferences);
      
      if (savedPreferences) {
        // Load recommendations based on preferences
        const recommendations = await getMovieRecommendations(savedPreferences);
        setMovies(recommendations);
        setShowRecommendationBanner(true);
      } else {
        // Load popular movies as default
        const popularData = await getPopularMovies(1);
        setMovies(popularData.results);
        setTotalPages(popularData.total_pages);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      setCurrentPage(1);
      setShowRecommendationBanner(false);
      
      const searchData = await searchMovies(query, 1);
      setMovies(searchData.results);
      setTotalPages(searchData.total_pages);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters: FilterState) => {
    try {
      setLoading(true);
      setShowRecommendationBanner(false);
      // Implement filtering logic here
      // For now, just reload popular movies
      const popularData = await getPopularMovies(1);
      setMovies(popularData.results);
      setTotalPages(popularData.total_pages);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchQuery('');
    await loadInitialData();
  };

  const loadMoreMovies = async () => {
    if (currentPage >= totalPages || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      
      let newData;
      if (searchQuery) {
        newData = await searchMovies(searchQuery, nextPage);
      } else {
        newData = await getPopularMovies(nextPage);
      }
      
      setMovies(prev => [...prev, ...newData.results]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreferences = () => {
    router.push('/preferences');
  };

  const goToRecommendations = () => {
    if (userPreferences) {
      router.push('/recommendations');
    } else {
      router.push('/preferences');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Spotlight</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Recommendation Banner */}
      {!searchQuery && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">
                  {userPreferences ? 'Get Your Personalized Recommendations' : 'Ready to Find Your Perfect Movie?'}
                </h2>
                <p className="text-blue-100">
                  {userPreferences 
                    ? `Based on your preferences: ${userPreferences.mood} mood • ${userPreferences.watchingWith}` 
                    : 'Tell us what you\'re in the mood for and get personalized movie recommendations'
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                {userPreferences && (
                  <button
                    onClick={goToRecommendations}
                    className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Get another Recommendation
                  </button>
                )}
                <button
                  onClick={goToPreferences}
                  className={`${userPreferences ? 'bg-green-700 hover:bg-green-800' : 'bg-white text-blue-600 hover:bg-gray-100'} px-6 py-3 rounded-lg font-semibold transition-colors`}
                >
                  {userPreferences ? 'Update what you like' : 'Set what you like'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current View Banner */}
   

      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
          {searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-gray-400">
                Search results for "{searchQuery}"
              </p>
              <button
                onClick={clearSearch}
                className="text-green-400 hover:text-blue-300"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

      

        {showRecommendationBanner && !searchQuery && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-3xl">Showing movies based on your preferences</span>
              </div>
              <button
                onClick={() => setShowRecommendationBanner(false)}
                className="text-green-100 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Movies Grid - Now fills the remaining space */}
        <div className="flex-1">
          <MovieGrid movies={movies} loading={loading && movies.length === 0} />

          {/* No Movies Found */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Unable to load movies at this time'}
              </p>
              {searchQuery ? (
                <button
                  onClick={clearSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Browse Popular Movies
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Load More Button */}
          {!loading && currentPage < totalPages && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreMovies}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Load More Movies
              </button>
            </div>
          )}

          {loading && movies.length > 0 && (
            <div className="mt-8 text-center">
              <div className="text-gray-400">Loading more movies...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}