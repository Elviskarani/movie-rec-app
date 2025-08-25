import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.poster_path 
    ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : '/placeholder.webp';

  // Safe date handling
  const getYear = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.getFullYear().toString();
  };

  return (
    <Link href={`/movie/${movie.id}`} className="block group">
      <div className="relative bg-gradient-to-b from-zinc-900 to-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-3xl group-hover:shadow-purple-500/20">
        {/* Backdrop blur overlay for hover effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10" />
        
        {/* Play button overlay */}
        
        {/* Movie poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Rating badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-white text-xs font-medium">
              {movie.vote_average?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 relative">
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2  transition-colors duration-300">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm font-medium">
              {getYear(movie.release_date)}
            </p>
            
            {/* Interactive rating */}
            <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-3 h-3 ${i < Math.round((movie.vote_average || 0) / 2) ? 'text-yellow-400' : 'text-zinc-600'}`}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar animation */}
         
        </div>

        {/* Spotify-style bottom glow */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
      </div>
    </Link>
  );
}