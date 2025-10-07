import axios from 'axios';
import Constants from 'expo-constants';
import { Movie, TMDBMovie, TMDBResponse } from '@/types/movie';

const TMDB_BEARER_TOKEN = Constants.expoConfig?.extra?.tmdbBearerToken || process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MOCK_MOVIES: TMDBMovie[] = [
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    release_date: '1994-09-23',
    genre_ids: [18, 80],
    vote_average: 8.7,
    vote_count: 24000,
    adult: false,
    original_language: 'en',
    original_title: 'The Shawshank Redemption',
    popularity: 95.4,
    video: false,
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    release_date: '1972-03-14',
    genre_ids: [18, 80],
    vote_average: 8.7,
    vote_count: 18000,
    adult: false,
    original_language: 'en',
    original_title: 'The Godfather',
    popularity: 90.1,
    video: false,
  },
  {
    id: 240,
    title: 'The Godfather Part II',
    overview: 'In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily.',
    poster_path: '/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
    backdrop_path: '/kGzFbGhp99zva6oZODW5atUtnqi.jpg',
    release_date: '1974-12-20',
    genre_ids: [18, 80],
    vote_average: 8.6,
    vote_count: 11000,
    adult: false,
    original_language: 'en',
    original_title: 'The Godfather Part II',
    popularity: 85.3,
    video: false,
  },
  {
    id: 424,
    title: "Schindler's List",
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives.",
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdrop_path: '/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
    release_date: '1993-12-15',
    genre_ids: [18, 36, 10752],
    vote_average: 8.6,
    vote_count: 14000,
    adult: false,
    original_language: 'en',
    original_title: "Schindler's List",
    popularity: 88.7,
    video: false,
  },
  {
    id: 19404,
    title: 'Dilwale Dulhania Le Jayenge',
    overview: 'Raj is a rich, carefree, happy-go-lucky second generation NRI who comes to India for the first time.',
    poster_path: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
    backdrop_path: '/90ez6ArvpO8bvpyIngBuwXOqJm5.jpg',
    release_date: '1995-10-20',
    genre_ids: [35, 18, 10749],
    vote_average: 8.7,
    vote_count: 4000,
    adult: false,
    original_language: 'hi',
    original_title: 'दिलवाले दुल्हनिया ले जायेंगे',
    popularity: 82.5,
    video: false,
  },
  {
    id: 389,
    title: '12 Angry Men',
    overview: 'The defense and the prosecution have rested and the jury is filing into the jury room.',
    poster_path: '/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg',
    backdrop_path: '/qqHQsStV6exghCM7zbObuYBiYxw.jpg',
    release_date: '1957-04-10',
    genre_ids: [18],
    vote_average: 8.5,
    vote_count: 7000,
    adult: false,
    original_language: 'en',
    original_title: '12 Angry Men',
    popularity: 79.8,
    video: false,
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    release_date: '2008-07-16',
    genre_ids: [18, 28, 80, 53],
    vote_average: 8.5,
    vote_count: 30000,
    adult: false,
    original_language: 'en',
    original_title: 'The Dark Knight',
    popularity: 98.2,
    video: false,
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, the Kim family takes peculiar interest in the wealthy Parks.',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    release_date: '2019-05-30',
    genre_ids: [35, 53, 18],
    vote_average: 8.5,
    vote_count: 16000,
    adult: false,
    original_language: 'ko',
    original_title: '기생충',
    popularity: 94.6,
    video: false,
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: 'A man with a low IQ has accomplished great things and been present during significant historic events.',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: '/7c9UVPPiTPltoZVDg1p1oftTWL5.jpg',
    release_date: '1994-07-06',
    genre_ids: [35, 18, 10749],
    vote_average: 8.5,
    vote_count: 25000,
    adult: false,
    original_language: 'en',
    original_title: 'Forrest Gump',
    popularity: 92.1,
    video: false,
  },
  {
    id: 769,
    title: 'GoodFellas',
    overview: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill.',
    poster_path: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    backdrop_path: '/sw7mordbZxgITU877yTpZCud90M.jpg',
    release_date: '1990-09-12',
    genre_ids: [18, 80],
    vote_average: 8.5,
    vote_count: 11000,
    adult: false,
    original_language: 'en',
    original_title: 'GoodFellas',
    popularity: 87.3,
    video: false,
  },
  {
    id: 346,
    title: 'Seven Samurai',
    overview: 'A samurai answers a village request to defend it from bandits.',
    poster_path: '/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg',
    backdrop_path: '/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg',
    release_date: '1954-04-26',
    genre_ids: [28, 18],
    vote_average: 8.5,
    vote_count: 3000,
    adult: false,
    original_language: 'ja',
    original_title: '七人の侍',
    popularity: 76.9,
    video: false,
  },
  {
    id: 667,
    title: 'Spirited Away',
    overview: 'A young girl becomes trapped in a strange new world of spirits.',
    poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    release_date: '2001-07-20',
    genre_ids: [16, 10751, 14],
    vote_average: 8.5,
    vote_count: 14000,
    adult: false,
    original_language: 'ja',
    original_title: '千と千尋の神隠し',
    popularity: 91.4,
    video: false,
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'A burger-loving hit man, a philosophical partner, and a robbery-prone couple intertwine.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
    release_date: '1994-09-10',
    genre_ids: [53, 80],
    vote_average: 8.5,
    vote_count: 26000,
    adult: false,
    original_language: 'en',
    original_title: 'Pulp Fiction',
    popularity: 96.8,
    video: false,
  },
  {
    id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    overview: "Gandalf and Aragorn lead the World of Men against Sauron's army.",
    poster_path: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    backdrop_path: '/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
    release_date: '2003-12-01',
    genre_ids: [12, 14, 28],
    vote_average: 8.5,
    vote_count: 22000,
    adult: false,
    original_language: 'en',
    original_title: 'The Lord of the Rings: The Return of the King',
    popularity: 95.7,
    video: false,
  },
  {
    id: 497,
    title: 'The Green Mile',
    overview: 'A tale set on death row in a Southern prison, where gentle giant John Coffey possesses mysterious powers.',
    poster_path: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
    backdrop_path: '/l6hQWH9eDksNJNiXWYRkWqikOdu.jpg',
    release_date: '1999-12-10',
    genre_ids: [14, 18, 80],
    vote_average: 8.5,
    vote_count: 15000,
    adult: false,
    original_language: 'en',
    original_title: 'The Green Mile',
    popularity: 89.2,
    video: false,
  },
];

class MovieService {
  private useRealAPI: boolean = false;

  constructor() {
    this.useRealAPI = !!TMDB_BEARER_TOKEN && TMDB_BEARER_TOKEN.length > 10;
    if (!this.useRealAPI) {
      console.log('Using mock movie data - Add TMDB Bearer token to use real data');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.useRealAPI) {
      return this.getMockData(endpoint, params) as T;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'accept': 'application/json',
        },
        params,
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`TMDB API Error [${endpoint}]:`, error.response?.status, error.message);
      return this.getMockData(endpoint, params) as T;
    }
  }

  private getMockData(endpoint: string, params: Record<string, any>): TMDBResponse {
    let results = [...MOCK_MOVIES];

    if (endpoint.includes('/search/movie') && params.query) {
      const query = params.query.toLowerCase();
      results = MOCK_MOVIES.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.overview.toLowerCase().includes(query)
      );
    }

    if (endpoint.includes('/discover/movie') && params.with_genres) {
      const genreId = Number(params.with_genres);
      results = MOCK_MOVIES.filter(movie => 
        movie.genre_ids.includes(genreId)
      );
    }

    const page = params.page || 1;
    const perPage = 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      page,
      results: results.slice(start, end),
      total_pages: Math.ceil(results.length / perPage),
      total_results: results.length,
    };
  }

  private transformTMDBMovie(tmdbMovie: TMDBMovie): Movie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      year: new Date(tmdbMovie.release_date || '2024-01-01').getFullYear(),
      genre: this.mapGenreIds(tmdbMovie.genre_ids || []),
      language: tmdbMovie.original_language || 'en',
      rating: tmdbMovie.vote_average || 0,
      plot: tmdbMovie.overview || '',
      director: '',
      cast: [],
      mood_tags: [],
      streaming_platforms: [],
      trailer_link: '',
      poster: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : '',
      poster_path: tmdbMovie.poster_path,
      backdrop_path: tmdbMovie.backdrop_path,
      overview: tmdbMovie.overview,
      release_date: tmdbMovie.release_date,
      vote_average: tmdbMovie.vote_average,
      vote_count: tmdbMovie.vote_count,
      adult: tmdbMovie.adult || false,
      age_rating: this.getAgeRating(tmdbMovie.adult || false, tmdbMovie.genre_ids || []),
    };
  }

  private mapGenreIds(genreIds: number[]): string[] {
    const genreMap: Record<number, string> = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western',
    };
    return genreIds.map(id => genreMap[id] || 'Unknown');
  }

  private getAgeRating(adult: boolean, genreIds: number[]): string {
    if (adult) return '18+';
    const horrorGenre = genreIds.includes(27);
    const thrillerGenre = genreIds.includes(53);
    if (horrorGenre || thrillerGenre) return 'PG-13';
    return 'PG';
  }

  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    const response = await this.makeRequest<TMDBResponse>('/movie/popular', { page });
    return response.results.map(movie => this.transformTMDBMovie(movie));
  }

  async searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    const response = await this.makeRequest<TMDBResponse>('/search/movie', { query, page });
    return response.results.map(movie => this.transformTMDBMovie(movie));
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
    const response = await this.makeRequest<TMDBResponse>('/discover/movie', {
      with_genres: genreId,
      page,
    });
    return response.results.map(movie => this.transformTMDBMovie(movie));
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    const mockMovie = MOCK_MOVIES.find(m => m.id === movieId);
    if (mockMovie) {
      return this.transformTMDBMovie(mockMovie);
    }
    
    if (this.useRealAPI) {
      const movie = await this.makeRequest<TMDBMovie>(`/movie/${movieId}`);
      return this.transformTMDBMovie(movie);
    }

    return this.transformTMDBMovie(MOCK_MOVIES[0]);
  }

  filterMoviesByAge(movies: Movie[]): Movie[] {
    return movies;
  }

  filterExcludingFavorites(movies: Movie[], favoriteIds: number[]): Movie[] {
    return movies.filter(movie => !favoriteIds.includes(movie.id));
  }
}

export const movieService = new MovieService();