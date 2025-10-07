import axios from 'axios';
import Constants from 'expo-constants';
import { Movie, TMDBMovie, TMDBResponse } from '@/types/movie';

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbApiKey || process.env.EXPO_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MOCK_MOVIES_BY_LANGUAGE: Record<string, TMDBMovie[]> = {
  en: [
    { id:278,title:'The Shawshank Redemption',overview:'Two imprisoned men bond over years, finding solace and redemption.',poster_path:'/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',backdrop_path:'/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',release_date:'1994-09-23',genre_ids:[18,80],vote_average:9.3,vote_count:2400000,adult:false,original_language:'en',original_title:'The Shawshank Redemption',popularity:95.4,video:false},
    { id:238,title:'The Godfather',overview:'The aging patriarch of an organized crime dynasty transfers control.',poster_path:'/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',backdrop_path:'/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',release_date:'1972-03-14',genre_ids:[18,80],vote_average:9.2,vote_count:1700000,adult:false,original_language:'en',original_title:'The Godfather',popularity:92.1,video:false},
    { id:155,title:'The Dark Knight',overview:'When a menace known as The Joker emerges, he wreaks havoc on Gotham.',poster_path:'/qJ2tW6WMUDux911r6m7haRef0WH.jpg',backdrop_path:'/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',release_date:'2008-07-18',genre_ids:[18,28,80,53],vote_average:9.0,vote_count:2500000,adult:false,original_language:'en',original_title:'The Dark Knight',popularity:98.2,video:false},
    { id:680,title:'Pulp Fiction',overview:'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.',poster_path:'/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',backdrop_path:'/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',release_date:'1994-10-14',genre_ids:[18,80,53],vote_average:8.9,vote_count:1900000,adult:false,original_language:'en',original_title:'Pulp Fiction',popularity:96.8,video:false}
  ],
  hi: [
    { id:19404,title:'Dilwale Dulhania Le Jayenge',overview:'Raj is a rich, carefree NRI who falls in love on a Europe trip.',poster_path:'/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',backdrop_path:'/90ez6ArvpO8bvpyIngBuwXOqJm5.jpg',release_date:'1995-10-20',genre_ids:[35,18,10749],vote_average:8.7,vote_count:4000,adult:false,original_language:'hi',original_title:'दिलवाले दुल्हनिया ले जायेंगे',popularity:82.5,video:false},
    { id:3782,title:'3 Idiots',overview:'Two friends revisit their college days searching for their missing companion.',poster_path:'/66A9MqXOyVFCssoloscwiegTPQ.jpg',backdrop_path:'/lC5OpQd8PNPyHx3tJKvY5A2APKG.jpg',release_date:'2009-12-25',genre_ids:[18,35],vote_average:8.4,vote_count:5000,adult:false,original_language:'hi',original_title:'3 Idiots',popularity:88.9,video:false},
    { id:364686,title:'Dangal',overview:'A former wrestler trains his daughters for the Commonwealth Games.',poster_path:'/lY5HgVqUErWTzFeGT17rwyQqOrD.jpg',backdrop_path:'/fRKOZkTO0WWzlsH9VhYcvJ21pk.jpg',release_date:'2016-12-23',genre_ids:[18,28],vote_average:8.3,vote_count:3200,adult:false,original_language:'hi',original_title:'दंगल',popularity:79.4,video:false}
  ],
  ja: [
    { id:12477,title:'Grave of the Fireflies',overview:'Two children struggle to survive in WWII Japan.',poster_path:'/k9tv1rXZbOhH7eiCk378x61kNQ1.jpg',backdrop_path:'/vkZSd0Lp8iCVBGpFH9L7LzLusjS.jpg',release_date:'1988-04-16',genre_ids:[16,18,10752],vote_average:8.5,vote_count:4800,adult:false,original_language:'ja',original_title:'火垂るの墓',popularity:83.7,video:false},
    { id:128,title:'Princess Mononoke',overview:'A struggle between forest gods and humans.',poster_path:'/jHWmNr7m544fJ8eItsfNk8fs2Ed.jpg',backdrop_path:'/6pTqSq0zYIWCsucJys8q5L92kUY.jpg',release_date:'1997-07-12',genre_ids:[12,16,14],vote_average:8.4,vote_count:6200,adult:false,original_language:'ja',original_title:'もののけ姫',popularity:87.6,video:false}
  ],
  ko: [
    { id:496243,title:'Parasite',overview:'A poor family schemes to become employed by a wealthy family.',poster_path:'/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',backdrop_path:'/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',release_date:'2019-05-30',genre_ids:[35,53,18],vote_average:8.5,vote_count:16000,adult:false,original_language:'ko',original_title:'기생충',popularity:94.6,video:false}
  ]
};

class MovieService {
  private useRealAPI = !!TMDB_API_KEY && TMDB_API_KEY.length > 10;

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.useRealAPI) return this.getMockData(endpoint, params) as T;
    try {
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        params: { api_key: TMDB_API_KEY, ...params },
        timeout: 10000
      });
      return response.data;
    } catch {
      return this.getMockData(endpoint, params) as T;
    }
  }

  private getMockData(endpoint: string, params: Record<string, any>): TMDBResponse {
    const langs = params.with_original_language?.split(',') || ['en'];
    let all: TMDBMovie[] = [];
    langs.forEach(l => { if (MOCK_MOVIES_BY_LANGUAGE[l]) all.push(...MOCK_MOVIES_BY_LANGUAGE[l]); });
    if (!all.length) all = MOCK_MOVIES_BY_LANGUAGE['en'];
    let results = all;
    if (endpoint.includes('/search/movie') && params.query) {
      const q = params.query.toLowerCase();
      results = all.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
    }
    if (endpoint.includes('/discover/movie') && params.with_genres) {
      const gid = Number(params.with_genres);
      results = results.filter(m => m.genre_ids.includes(gid));
    }
    return { page: params.page||1, results: results.slice(0,20), total_pages:1, total_results:results.length };
  }

  private transform(m: TMDBMovie): Movie {
    return {
      id: m.id,
      title: m.title,
      year: new Date(m.release_date).getFullYear(),
      genre: this.mapGenres(m.genre_ids),
      language: m.original_language,
      rating: Number(m.vote_average.toFixed(1)),
      plot: m.overview,
      director: '',
      cast: [],
      mood_tags: [],
      streaming_platforms: ['TMDB'],
      trailer_link: '',
      poster: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : '',
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      overview: m.overview,
      release_date: m.release_date,
      vote_average: m.vote_average,
      vote_count: m.vote_count,
      adult: m.adult,
      age_rating: this.getAgeRating(m.adult, m.genre_ids)
    };
  }

  private mapGenres(ids: number[]): string[] {
    const map: Record<number,string> = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'};
    return ids.map(i => map[i]||'Unknown');
  }

  private getAgeRating(adult:boolean, ids:number[]):string {
    if(adult) return '18+';
    if(ids.includes(27)||ids.includes(53)) return 'PG-13';
    return 'PG';
  }

  async getPopularMovies(page=1, languages:string[]=['en']):Promise<Movie[]> {
    const res = await this.makeRequest<TMDBResponse>('/movie/popular',{page,with_original_language:languages.join(',')});
    return res.results.map(this.transform.bind(this));
  }
  async searchMovies(q:string,page=1,langs:string[]=['en']):Promise<Movie[]> {
    const res = await this.makeRequest<TMDBResponse>('/search/movie',{query:q,page,with_original_language:langs.join(',')});
    return res.results.map(this.transform.bind(this));
  }
  async getMoviesByGenre(gid:number,page=1,langs:string[]=['en']):Promise<Movie[]> {
    const res = await this.makeRequest<TMDBResponse>('/discover/movie',{with_genres:gid,page,with_original_language:langs.join(','),sort_by:'popularity.desc'});
    return res.results.map(this.transform.bind(this));
  }
  async getMovieDetails(id:number):Promise<Movie> {
    for(const langMovies of Object.values(MOCK_MOVIES_BY_LANGUAGE)){
      const found=langMovies.find(m=>m.id===id);
      if(found) return this.transform(found);
    }
    if(this.useRealAPI){
      const movie = await this.makeRequest<TMDBMovie>(`/movie/${id}`);
      return this.transform(movie);
    }
    return this.transform(MOCK_MOVIES_BY_LANGUAGE['en'][0]);
  }
  filterMoviesByAge(ms:Movie[]):Movie[]{return ms;}
  filterExcludingFavorites(ms:Movie[],fids:number[]):Movie[]{return ms.filter(m=>!fids.includes(m.id));}
}

export const movieService = new MovieService();
