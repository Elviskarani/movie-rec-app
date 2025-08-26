import { Movie, MovieDetails, UserPreferences, Genre } from './types';
import { 
  withCache, 
  generateCacheKey, 
  CACHE_DURATIONS 
} from './redis';
import * as originalTmdb from './tmdb';

// Cached version of getMovieRecommendations
export const getMovieRecommendations = async (
  preferences: UserPreferences, 
  page: number = 1
): Promise<Movie[]> => {
  const cacheKey = generateCacheKey('recommendations', { 
    ...preferences, 
    page 
  });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getMovieRecommendations(preferences, page),
    CACHE_DURATIONS.RECOMMENDATIONS
  );
};

// Cached version of getExtendedRecommendations
export const getExtendedRecommendations = async (
  preferences: UserPreferences, 
  totalMovies: number = 40
): Promise<Movie[]> => {
  const cacheKey = generateCacheKey('extended_recommendations', { 
    ...preferences, 
    totalMovies 
  });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getExtendedRecommendations(preferences, totalMovies),
    CACHE_DURATIONS.RECOMMENDATIONS
  );
};

// Cached version of searchMovies
export const searchMovies = async (
  query: string, 
  page: number = 1
): Promise<{ results: Movie[], total_pages: number }> => {
  const cacheKey = generateCacheKey('search', { query, page });
  
  return withCache(
    cacheKey,
    () => originalTmdb.searchMovies(query, page),
    CACHE_DURATIONS.SEARCH_RESULTS
  );
};

// Cached version of getMovieDetails
export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  const cacheKey = generateCacheKey('movie_details', { id });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getMovieDetails(id),
    CACHE_DURATIONS.MOVIE_DETAILS
  );
};

// Cached version of getGenres
export const getGenres = async (): Promise<Genre[]> => {
  const cacheKey = 'genres:all';
  
  return withCache(
    cacheKey,
    () => originalTmdb.getGenres(),
    CACHE_DURATIONS.GENRES
  );
};

// Cached version of getPopularMovies
export const getPopularMovies = async (
  page: number = 1
): Promise<{ results: Movie[], total_pages: number }> => {
  const cacheKey = generateCacheKey('popular', { page });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getPopularMovies(page),
    CACHE_DURATIONS.POPULAR_MOVIES
  );
};

// Cached version of getTopRatedMovies
export const getTopRatedMovies = async (
  page: number = 1
): Promise<{ results: Movie[], total_pages: number }> => {
  const cacheKey = generateCacheKey('top_rated', { page });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getTopRatedMovies(page),
    CACHE_DURATIONS.TOP_RATED
  );
};

// Cached version of getSimilarMovies
export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  const cacheKey = generateCacheKey('similar', { movieId });
  
  return withCache(
    cacheKey,
    () => originalTmdb.getSimilarMovies(movieId),
    CACHE_DURATIONS.SIMILAR_MOVIES
  );
};

// Re-export any utility functions that don't need caching
export { default as tmdbApi } from './tmdb';