// services/movieRecommendationEngine.ts
import { Movie, MovieRecommendation } from '@/types/movie';
import { MoodAnalysis, MoodScore } from '@/types/mood';
import { PuzzleResponse } from '@/types/puzzle';
import { tmdbService } from './tmdbService';
import { PUZZLES } from '@/constants/Puzzles';

export class MovieRecommendationEngine {
  private moodToGenreMap: { [key: string]: number[] } = {
    energetic: [28, 12, 878, 53],
    calm: [10749, 18, 99, 10402],
    happy: [35, 10751, 16, 10749],
    nostalgic: [36, 10402, 18, 10749],
    excited: [28, 12, 53, 27],
    thoughtful: [18, 99, 9648, 878],
    romantic: [10749, 18, 35, 10402],
    anxious: [53, 27, 80, 9648],
    peaceful: [10749, 18, 99, 10751],
    intense: [28, 53, 80, 27],
    creative: [16, 14, 10402, 878],
    melancholic: [18, 10402, 36, 10749],
  };

  private colorMoodMapping: { [key: string]: string[] } = {
    warm_energetic: ['energetic', 'excited', 'intense'],
    cool_calm: ['calm', 'peaceful', 'thoughtful'],
    dark_moody: ['melancholic', 'thoughtful', 'nostalgic'],
    bright_happy: ['happy', 'excited', 'energetic'],
    muted_soft: ['calm', 'peaceful', 'anxious'],
  };

  private patternMoodMapping: { [key: string]: string[] } = {
    angular_sharp: ['energetic', 'intense', 'focused'],
    curved_flowing: ['calm', 'peaceful', 'romantic'],
    chaotic_complex: ['anxious', 'creative', 'intense'],
    symmetrical_ordered: ['calm', 'thoughtful', 'focused'],
  };

  private rhythmMoodMapping: { [key: string]: string[] } = {
    fast_upbeat: ['energetic', 'excited', 'happy'],
    moderate_steady: ['calm', 'focused', 'balanced'],
    slow_peaceful: ['calm', 'peaceful', 'romantic'],
    complex_irregular: ['thoughtful', 'creative', 'anxious'],
  };

  async generateRecommendations(
    moodAnalysis: MoodAnalysis,
    puzzleResponses: PuzzleResponse[],
    selectedLanguages: string[] = ['en'],
    limit: number = 20
  ): Promise<MovieRecommendation[]> {
    const detailedMoods = this.extractDetailedMoods(puzzleResponses);
    const genreIds = this.calculateGenresFromMoods(moodAnalysis, detailedMoods);
    const uniqueGenreIds = Array.from(new Set(genreIds)).slice(0, 5);

    console.log('Mood Analysis:', moodAnalysis.primaryMood);
    console.log('Detailed Moods:', detailedMoods);
    console.log('Selected Genres:', uniqueGenreIds);
    console.log('Selected Languages:', selectedLanguages);

    const moviePromises: Promise<Movie[]>[] = [];

    if (selectedLanguages.length > 0) {
      selectedLanguages.forEach((language) => {
        uniqueGenreIds.slice(0, 3).forEach((genreId) => {
          moviePromises.push(
            tmdbService.getMoviesByGenreAndLanguage(genreId, language, 1)
          );
        });
      });
    }

    moviePromises.push(tmdbService.getPopularMovies(1));
    moviePromises.push(tmdbService.getTopRatedMovies(1));

    const results = await Promise.all(moviePromises);
    const allMovies = results.flat();
    let uniqueMovies = this.deduplicateMovies(allMovies);

    if (selectedLanguages.length > 0) {
      uniqueMovies = uniqueMovies.filter((movie) =>
        selectedLanguages.some(lang => 
          movie.language.toLowerCase() === lang.toLowerCase()
        )
      );
    }

    const detailedMovies = await Promise.all(
      uniqueMovies.slice(0, limit * 2).map(async (movie) => {
        const details = await tmdbService.getMovieDetails(movie.id);
        return details || movie;
      })
    );

    const recommendations = detailedMovies.map((movie) => ({
      movie,
      matchScore: this.calculateAdvancedMatchScore(
        movie,
        moodAnalysis,
        detailedMoods,
        puzzleResponses
      ),
      reason: this.generateDetailedReason(movie, moodAnalysis, detailedMoods),
    }));

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, limit);
  }

  private extractDetailedMoods(responses: PuzzleResponse[]): string[] {
    const moods: string[] = [];

    responses.forEach((response) => {
      const puzzle = PUZZLES.find((p) => p.id === response.puzzleId);
      if (!puzzle) return;

      switch (puzzle.type) {
        case 'color_harmony':
          const colorMoods = this.colorMoodMapping[response.selectedOption] || [];
          moods.push(...colorMoods);
          break;

        case 'pattern_completion':
          const patternMoods = this.patternMoodMapping[response.selectedOption] || [];
          moods.push(...patternMoods);
          break;

        case 'rhythm_matching':
          const rhythmMoods = this.rhythmMoodMapping[response.selectedOption] || [];
          moods.push(...rhythmMoods);
          break;

        case 'story_context':
          if (response.selectedOption.includes('excited')) {
            moods.push('excited', 'adventurous');
          } else if (response.selectedOption.includes('peaceful')) {
            moods.push('calm', 'thoughtful');
          } else if (response.selectedOption.includes('anxious')) {
            moods.push('anxious', 'intense');
          } else if (response.selectedOption.includes('nostalgic')) {
            moods.push('nostalgic', 'melancholic');
          }
          break;

        case 'image_association':
          if (response.selectedOption.includes('nature')) {
            moods.push('calm', 'peaceful');
          } else if (response.selectedOption.includes('city')) {
            moods.push('energetic', 'excited');
          } else if (response.selectedOption.includes('abstract')) {
            moods.push('creative', 'thoughtful');
          } else if (response.selectedOption.includes('minimal')) {
            moods.push('calm', 'focused');
          }
          break;
      }
    });

    return moods;
  }

  private calculateGenresFromMoods(
    moodAnalysis: MoodAnalysis,
    detailedMoods: string[]
  ): number[] {
    const genreIds: number[] = [];
    const moodFrequency: { [key: string]: number } = {};

    detailedMoods.forEach((mood) => {
      moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
    });

    const primaryMood = moodAnalysis.primaryMood.toLowerCase();
    const secondaryMood = moodAnalysis.secondaryMood?.toLowerCase();

    const primaryGenres = this.moodToGenreMap[primaryMood] || [];
    genreIds.push(...primaryGenres.slice(0, 3));

    if (secondaryMood) {
      const secondaryGenres = this.moodToGenreMap[secondaryMood] || [];
      genreIds.push(...secondaryGenres.slice(0, 2));
    }

    Object.entries(moodFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .forEach(([mood]) => {
        const additionalGenres = this.moodToGenreMap[mood] || [];
        genreIds.push(...additionalGenres.slice(0, 2));
      });

    return genreIds;
  }

  private calculateAdvancedMatchScore(
    movie: Movie,
    moodAnalysis: MoodAnalysis,
    detailedMoods: string[],
    puzzleResponses: PuzzleResponse[]
  ): number {
    let score = 0;

    const primaryMood = moodAnalysis.primaryMood.toLowerCase();
    const secondaryMood = moodAnalysis.secondaryMood?.toLowerCase();

    detailedMoods.forEach((mood) => {
      movie.mood_tags.forEach((tag) => {
        if (tag.toLowerCase().includes(mood) || mood.includes(tag.toLowerCase())) {
          if (mood === primaryMood) {
            score += 15;
          } else if (mood === secondaryMood) {
            score += 10;
          } else {
            score += 5;
          }
        }
      });
    });

    const moodFrequency: { [key: string]: number } = {};
    detailedMoods.forEach((mood) => {
      moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
    });

    Object.entries(moodFrequency).forEach(([mood, frequency]) => {
      movie.mood_tags.forEach((tag) => {
        if (tag.toLowerCase().includes(mood)) {
          score += frequency * 3;
        }
      });
    });

    score += movie.rating * 6;

    if (movie.vote_count && movie.vote_count > 1000) {
      score += Math.min(movie.vote_count / 100, 15);
    }

    if (movie.vote_count && movie.vote_count > 5000) {
      score += 5;
    }

    const responseSpeed = puzzleResponses.reduce((sum, r) => sum + r.responseTime, 0) / puzzleResponses.length;
    if (responseSpeed < 3000) {
      score += 5;
    } else if (responseSpeed > 8000) {
      score += 3;
    }

    score += Math.random() * 8;

    return Math.min(Math.round(score), 100);
  }

  private generateDetailedReason(
    movie: Movie,
    moodAnalysis: MoodAnalysis,
    detailedMoods: string[]
  ): string {
    const primaryMood = moodAnalysis.primaryMood.toLowerCase();
    const genres = movie.genre.slice(0, 2).join(' and ');
    
    const moodFrequency: { [key: string]: number } = {};
    detailedMoods.forEach((mood) => {
      moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
    });

    const topSecondaryMood = Object.entries(moodFrequency)
      .filter(([mood]) => mood !== primaryMood)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const reasons: { [key: string]: string[] } = {
      energetic: [
        `High-energy ${genres} perfect for your dynamic mood`,
        `Action-packed ${genres} matching your vibrant energy`,
        `Thrilling ${genres} that channels your excitement`,
      ],
      calm: [
        `Peaceful ${genres} ideal for your relaxed state`,
        `Soothing ${genres} that complements your tranquility`,
        `Gentle ${genres} for your calm mindset`,
      ],
      happy: [
        `Feel-good ${genres} enhancing your joyful mood`,
        `Uplifting ${genres} that resonates with your happiness`,
        `Cheerful ${genres} perfect for your positive vibes`,
      ],
      nostalgic: [
        `Touching ${genres} that speaks to your reflective mood`,
        `Sentimental ${genres} evoking meaningful memories`,
        `Heartfelt ${genres} matching your nostalgic feelings`,
      ],
      excited: [
        `Thrilling ${genres} for your adventurous spirit`,
        `Dynamic ${genres} matching your enthusiasm`,
        `Exhilarating ${genres} perfect for your eager mood`,
      ],
      thoughtful: [
        `Profound ${genres} for your contemplative state`,
        `Thought-provoking ${genres} engaging your introspective mind`,
        `Deep ${genres} that resonates with your reflective mood`,
      ],
      romantic: [
        `Heartwarming ${genres} for your loving mood`,
        `Tender ${genres} that touches your romantic side`,
        `Beautiful ${genres} perfect for your emotional state`,
      ],
      anxious: [
        `Comforting ${genres} to ease your tension`,
        `Engaging ${genres} that provides relief and distraction`,
        `Uplifting ${genres} to help you relax`,
      ],
    };

    const primaryReasons = reasons[primaryMood] || [`Great ${genres} choice for your current mood`];
    let reason = primaryReasons[Math.floor(Math.random() * primaryReasons.length)];

    if (topSecondaryMood && topSecondaryMood !== primaryMood) {
      reason += ` with ${topSecondaryMood} undertones`;
    }

    return reason;
  }

  private deduplicateMovies(movies: Movie[]): Movie[] {
    const seen = new Set<number>();
    return movies.filter((movie) => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }
}

export const recommendationEngine = new MovieRecommendationEngine();