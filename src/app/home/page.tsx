'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Movie, Genre, UserPreferences } from '@/lib/types';
import { getStorageItem } from '@/lib/storage';
import { 
  searchMovies, 
  getPopularMovies, 
  getGenres 
} from '@/lib/tmdb';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';

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
  const [showGenreBanner, setShowGenreBanner] = useState(false);

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
      
      if (savedPreferences && savedPreferences.genre && savedPreferences.genre !== 'any') {
        // Load movies filtered by genre only
        const genreMovies = await getMoviesByGenre(savedPreferences.genre, 1);
        setMovies(genreMovies.results);
        setTotalPages(genreMovies.total_pages);
        setShowGenreBanner(true);
        setCurrentPage(1);
      } else {
        // Load popular movies as default
        const popularData = await getPopularMovies(1);
        setMovies(popularData.results);
        setTotalPages(popularData.total_pages);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // New function to get movies by genre only
  const getMoviesByGenre = async (genre: string, page: number = 1): Promise<{ results: Movie[], total_pages: number }> => {
    try {
      const genreMap: Record<string, number> = {
        action: 28,
        adventure: 12,
        animation: 16,
        comedy: 35,
        crime: 80,
        documentary: 99,
        drama: 18,
        family: 10751,
        fantasy: 14,
        history: 36,
        horror: 27,
        music: 10402,
        mystery: 9648,
        romance: 10749,
        'science fiction': 878,
        'tv movie': 10770,
        thriller: 53,
        war: 10752,
        western: 37
      };

      const genreId = genreMap[genre.toLowerCase()];
      if (!genreId) {
        // If genre not found, return popular movies
        return await getPopularMovies(page);
      }

      // Use the discover endpoint to get movies by genre
      const response = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&vote_count.gte=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch genre movies');
      }
      
      const data = await response.json();
      return {
        results: data.results || [],
        total_pages: data.total_pages || 0
      };
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      // Fallback to popular movies
      return await getPopularMovies(page);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      setCurrentPage(1);
      setShowGenreBanner(false);
      
      const searchData = await searchMovies(query, 1);
      setMovies(searchData.results);
      setTotalPages(searchData.total_pages);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchQuery('');
    setCurrentPage(1);
    await loadInitialData();
  };

  const goToNextPage = async () => {
    if (currentPage >= totalPages || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      
      let newData;
      if (searchQuery) {
        newData = await searchMovies(searchQuery, nextPage);
      } else if (userPreferences && userPreferences.genre && userPreferences.genre !== 'any') {
        // Load next page of genre-filtered movies
        newData = await getMoviesByGenre(userPreferences.genre, nextPage);
      } else {
        newData = await getPopularMovies(nextPage);
      }
      
      setMovies(newData.results); // Replace movies instead of appending
      setCurrentPage(nextPage);
      
      // Scroll to top when new page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousPage = async () => {
    if (currentPage <= 1 || loading) return;

    try {
      setLoading(true);
      const prevPage = currentPage - 1;
      
      let newData;
      if (searchQuery) {
        newData = await searchMovies(searchQuery, prevPage);
      } else if (userPreferences && userPreferences.genre && userPreferences.genre !== 'any') {
        // Load previous page of genre-filtered movies
        newData = await getMoviesByGenre(userPreferences.genre, prevPage);
      } else {
        newData = await getPopularMovies(prevPage);
      }
      
      setMovies(newData.results); // Replace movies instead of appending
      setCurrentPage(prevPage);
      
      // Scroll to top when new page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading previous page:', error);
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

        {/* Genre Banner */}
        {showGenreBanner && !searchQuery && userPreferences && (
          <div className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-3xl">
                    Showing {userPreferences.genre} movies
                  </span>
                </div>
                <button
                  onClick={() => setShowGenreBanner(false)}
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

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentPage <= 1
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentPage >= totalPages
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next
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