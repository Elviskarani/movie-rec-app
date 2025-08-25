export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export interface UserWithPassword extends User {
    password: string;
  }
  
  export interface UserPreferences {
    mood: string;
    watchingWith: string;
    genre: string;
    oldMovie: boolean;
    ageAppropriate: boolean;
    category: string;
  }
  
  export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    adult: boolean;
  }
  
  export interface MovieDetails extends Movie {
    genres: Genre[];
    runtime: number;
    budget: number;
    revenue: number;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    spoken_languages: SpokenLanguage[];
  }
  
  export interface Genre {
    id: number;
    name: string;
  }
  
  export interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string;
    origin_country: string;
  }
  
  export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
  }
  
  export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
  }