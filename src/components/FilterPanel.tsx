'use client';

import { useState } from 'react';
import { Genre } from '@/lib/types';

interface FilterPanelProps {
  genres: Genre[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  genre: string;
  year: string;
  rating: string;
  sortBy: string;
}

export default function FilterPanel({ genres, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: '',
    year: '',
    rating: '',
    sortBy: 'popularity.desc'
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity.desc'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Genre Filter */}
          <div className="min-w-[200px] flex-1">
            <label className="block text-gray-300 mb-2 text-sm font-medium">Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => updateFilter('genre', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id.toString()}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="min-w-[140px]">
            <label className="block text-gray-300 mb-2 text-sm font-medium">Year</label>
            <select
              value={filters.year}
              onChange={(e) => updateFilter('year', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2010-2019">2010-2019</option>
              <option value="2000-2009">2000-2009</option>
              <option value="1990-1999">1990-1999</option>
              <option value="before-1990">Before 1990</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="min-w-[140px]">
            <label className="block text-gray-300 mb-2 text-sm font-medium">Min Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => updateFilter('rating', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="8">8.0+</option>
              <option value="7">7.0+</option>
              <option value="6">6.0+</option>
              <option value="5">5.0+</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="min-w-[180px]">
            <label className="block text-gray-300 mb-2 text-sm font-medium">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity.desc">Popularity ↓</option>
              <option value="popularity.asc">Popularity ↑</option>
              <option value="vote_average.desc">Rating ↓</option>
              <option value="vote_average.asc">Rating ↑</option>
              <option value="release_date.desc">Newest</option>
              <option value="release_date.asc">Oldest</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="min-w-[100px]">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors h-[40px]"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}