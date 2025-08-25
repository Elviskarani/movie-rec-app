import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails } from '@/lib/tmdb';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id);
  
  if (isNaN(movieId)) {
    notFound();
  }

  const movie = await getMovieDetails(movieId);

  if (!movie) {
    notFound();
  }

  const imageUrl = movie.poster_path 
    ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : '/placeholder-movie.jpg';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : '';

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-96 overflow-hidden">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>
      )}

      <div className="relative -mt-32 z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/home"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            ← Back to Movies
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-80 mx-auto lg:mx-0">
                <Image
                  src={imageUrl}
                  alt={movie.title}
                  width={320}
                  height={480}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>

            {/* Movie Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {movie.title}
              </h1>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-xl">⭐</span>
                  <span className="text-white ml-2 text-lg">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-gray-400 ml-1">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                </div>

                <span className="text-gray-400">
                  {new Date(movie.release_date).getFullYear()}
                </span>

                {movie.runtime && (
                  <span className="text-gray-400">
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {movie.overview}
                </p>
              </div>

              {/* Production Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movie.production_companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Production Companies
                    </h3>
                    <ul className="text-gray-300">
                      {movie.production_companies.slice(0, 3).map((company) => (
                        <li key={company.id}>{company.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {movie.production_countries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Countries
                    </h3>
                    <ul className="text-gray-300">
                      {movie.production_countries.map((country) => (
                        <li key={country.iso_3166_1}>{country.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Budget
                    </h3>
                    <p className="text-gray-300">
                      ${movie.budget.toLocaleString()}
                    </p>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Revenue
                    </h3>
                    <p className="text-gray-300">
                      ${movie.revenue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}