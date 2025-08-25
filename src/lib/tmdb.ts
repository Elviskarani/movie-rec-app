import axios from 'axios';
import { Movie, MovieDetails, UserPreferences, Genre } from './types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

if (!TMDB_API_KEY) {
  // Warn once during startup if API key is missing
  console.warn('[TMDB] Missing NEXT_PUBLIC_TMDB_API_KEY. Requests will fail.');
}
if (!BASE_URL) {
  console.warn('[TMDB] Missing NEXT_PUBLIC_TMDB_BASE_URL. Set it to https://api.themoviedb.org/3');
}

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  },
  // Guard against hanging requests
  timeout: 10000,
});

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

const getGenreId = (genreName: string): number | undefined => {
  return genreMap[genreName.toLowerCase()];
};

// Enhanced function to get recommendations with better variety
export const getMovieRecommendations = async (preferences: UserPreferences, page: number = 1): Promise<Movie[]> => {
  try {
    let endpoint = '/discover/movie';
    let params: any = {
      sort_by: 'popularity.desc',
      page,
      vote_count_gte: 50, // Ensure movies have some votes
    };

    // Genre filtering
    if (preferences.genre && preferences.genre !== 'any') {
      const genreId = getGenreId(preferences.genre);
      if (genreId) {
        params.with_genres = genreId;
      }
    }

    // Age appropriate filtering
    if (preferences.ageAppropriate) {
      params.certification_country = 'US';
      params.certification = 'G,PG,PG-13';
    }

    // Old movie filtering
    if (preferences.oldMovie) {
      params.primary_release_date_lte = '2010-12-31';
      params.primary_release_date_gte = '1980-01-01'; // Don't go too old
    } else {
      params.primary_release_date_gte = '2000-01-01'; // Modern movies
    }

    // Category-based sorting and filtering
    if (preferences.category) {
      switch (preferences.category) {
        case 'top_rated':
          params.sort_by = 'vote_average.desc';
          params.vote_count_gte = 1000;
          params.vote_average_gte = 7.0;
          break;
        case 'latest':
          params.sort_by = 'release_date.desc';
          params.primary_release_date_lte = new Date().toISOString().split('T')[0];
          break;
        case 'popular':
        default:
          params.sort_by = 'popularity.desc';
          break;
      }
    }

    // Mood-based adjustments
    switch (preferences.mood) {
      case 'happy':
        if (!params.with_genres) {
          params.with_genres = [35, 16, 10751].join(','); // Comedy, Animation, Family
        }
        break;
      case 'sad':
        if (!params.with_genres) {
          params.with_genres = [18, 10749].join(','); // Drama, Romance
        }
        break;
      case 'excited':
        if (!params.with_genres) {
          params.with_genres = [28, 12, 53].join(','); // Action, Adventure, Thriller
        }
        break;
      case 'adventurous':
        if (!params.with_genres) {
          params.with_genres = [12, 14, 878].join(','); // Adventure, Fantasy, Sci-Fi
        }
        break;
      case 'romantic':
        if (!params.with_genres) {
          params.with_genres = [10749, 35].join(','); // Romance, Comedy
        }
        break;
    }

    // Watching with adjustments
    switch (preferences.watchingWith) {
      case 'kids':
        params.certification = 'G,PG';
        if (!params.with_genres) {
          params.with_genres = [16, 10751].join(','); // Animation, Family
        }
        break;
      case 'family':
        params.certification = 'G,PG,PG-13';
        if (!params.with_genres) {
          params.with_genres = [10751, 16, 12].join(','); // Family, Animation, Adventure
        }
        break;
    }

    const response = await tmdbApi.get(endpoint, { params });
    
    // Shuffle results to provide variety
    const movies = response.data.results || [];
    return shuffleArray(movies);
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      console.error('[TMDB] Request timed out');
    } else {
      console.error('Error fetching recommendations:', error?.message || error);
    }
    return [];
  }
};

// Helper function to shuffle array for variety
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get multiple pages of recommendations for better variety
export const getExtendedRecommendations = async (preferences: UserPreferences, totalMovies: number = 40): Promise<Movie[]> => {
  try {
    const moviesPerPage = 20;
    const pagesToFetch = Math.ceil(totalMovies / moviesPerPage);
    const allMovies: Movie[] = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const movies = await getMovieRecommendations(preferences, page);
      allMovies.push(...movies);
      
      if (allMovies.length >= totalMovies) break;
    }

    return shuffleArray(allMovies).slice(0, totalMovies);
  } catch (error) {
    console.error('Error fetching extended recommendations:', error);
    return [];
  }
};

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: Movie[], total_pages: number }> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    return { results: [], total_pages: 0 };
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    const response = await tmdbApi.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getPopularMovies = async (page: number = 1): Promise<{ results: Movie[], total_pages: number }> => {
  try {
    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return { results: [], total_pages: 0 };
  }
};

export const getTopRatedMovies = async (page: number = 1): Promise<{ results: Movie[], total_pages: number }> => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return { results: [], total_pages: 0 };
  }
};

// Get similar movies for better recommendations
export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};