// app/(tabs)/movies.tsx (Fixed - Add Language Filter)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMovieStore } from '@/store/useMovieStore';
import { useMoodStore } from '@/store/useMoodStore';
import { movieService } from '@/services/movieService';
import { useMovieRecommendations } from '@/hooks/useMovieRecommendations';
import MovieCard from '@/components/movie/MovieCard';
import SearchBar from '@/components/movie/SearchBar';
import LanguageSelector from '@/components/movie/LanguageSelector';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'recommendations', title: 'Recommendations', icon: '🎯' },
  { id: 'popular', title: 'Popular', icon: '🔥' },
  { id: 'toprated', title: 'Top Rated', icon: '⭐' },
  { id: 'nowplaying', title: 'Now Playing', icon: '🎬' },
  { id: 'upcoming', title: 'Upcoming', icon: '📅' },
];

export default function MoviesScreen() {
  const [activeCategory, setActiveCategory] = useState('recommendations');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['all']);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const { currentMoodAnalysis } = useMoodStore();
  const { recommendations, searchResults, setSearchResults } = useMovieStore();
  const { generateRecommendations, refreshRecommendations } = useMovieRecommendations();

  useEffect(() => {
    loadMovies();
  }, [activeCategory, selectedLanguages]);

  const loadMovies = async () => {
    if (activeCategory === 'recommendations') {
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        if (currentMoodAnalysis) {
          await generateRecommendations();
        } else {
          setMovies([]);
        }
        return;
      }
      let filteredMovies = recommendations.map(r => r.movie) || [];
      
      // Filter by language if not 'all'
      if (!selectedLanguages.includes('all') && selectedLanguages.length > 0) {
        filteredMovies = filteredMovies.filter(movie => 
          selectedLanguages.includes(movie.language?.toLowerCase() || 'en')
        );
      }
      
      setMovies(filteredMovies);
      return;
    }

    setLoading(true);
    try {
      let result = [];
      switch (activeCategory) {
        case 'popular':
          result = await movieService.getPopularMovies();
          break;
        case 'toprated':
          result = await movieService.getTopRatedMovies();
          break;
        case 'nowplaying':
          result = await movieService.getNowPlayingMovies();
          break;
        case 'upcoming':
          result = await movieService.getUpcomingMovies();
          break;
        default:
          result = [];
      }
      
      // Filter by language if not 'all'
      if (!selectedLanguages.includes('all') && selectedLanguages.length > 0) {
        result = result.filter(movie => 
          selectedLanguages.includes(movie.language?.toLowerCase() || 'en')
        );
      }
      
      setMovies(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query || '');
    if (!query || typeof query !== 'string' || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await movieService.searchMovies(query.trim());
      let filteredResults = Array.isArray(results) ? results : [];
      
      // Filter search results by language
      if (!selectedLanguages.includes('all') && selectedLanguages.length > 0) {
        filteredResults = filteredResults.filter(movie => 
          selectedLanguages.includes(movie.language?.toLowerCase() || 'en')
        );
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLanguageToggle = (languageCode) => {
    if (languageCode === 'all') {
      setSelectedLanguages(['all']);
    } else {
      setSelectedLanguages(prev => {
        const filtered = prev.filter(lang => lang !== 'all');
        if (filtered.includes(languageCode)) {
          const newLangs = filtered.filter(lang => lang !== languageCode);
          return newLangs.length === 0 ? ['all'] : newLangs;
        } else {
          return [...filtered, languageCode];
        }
      });
    }
  };

  const handleRefresh = async () => {
    if (activeCategory === 'recommendations') {
      await refreshRecommendations();
    } else {
      await loadMovies();
    }
  };

  const getDisplayMovies = () => {
    if (searchQuery && Array.isArray(searchResults)) {
      return searchResults;
    }
    return Array.isArray(movies) ? movies : [];
  };

  const getEmptyMessage = () => {
    if (searchQuery) {
      return 'No movies found for your search';
    }
    if (activeCategory === 'recommendations' && !currentMoodAnalysis) {
      return 'Complete mood puzzles to get recommendations';
    }
    if (!selectedLanguages.includes('all') && selectedLanguages.length > 0) {
      return `No movies found for selected language(s)`;
    }
    return 'No movies available';
  };

  const displayMovies = getDisplayMovies();

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movies</Text>
        <SearchBar
          onSearch={handleSearch}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!searchQuery && (
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(category) => category.id}
            contentContainerStyle={styles.tabsContent}
            renderItem={({ item: category }) => (
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeCategory === category.id && styles.activeTab,
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text style={styles.tabIcon}>{category.icon}</Text>
                <Text style={[
                  styles.tabText,
                  activeCategory === category.id && styles.activeTabText,
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Language Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.languageFilterButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons name="language" size={20} color="#007AFF" />
          <Text style={styles.languageFilterText}>
            {selectedLanguages.includes('all') 
              ? 'All Languages' 
              : `${selectedLanguages.length} Language${selectedLanguages.length > 1 ? 's' : ''}`
            }
          </Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {activeCategory === 'recommendations' && !currentMoodAnalysis && !searchQuery && (
        <View style={styles.noMoodContainer}>
          <Text style={styles.noMoodText}>
            Complete mood puzzles to get personalized recommendations
          </Text>
          <Button
            title="Take Mood Puzzle"
            onPress={() => {
              // Navigate to puzzles tab
            }}
            style={styles.puzzleButton}
          />
        </View>
      )}
    </View>
  );

  const renderMovieItem = ({ item, index }) => (
    <View style={[styles.movieWrapper, index % 2 === 1 && styles.movieWrapperRight]}>
      <MovieCard movie={item} showFavoriteButton={true} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="film-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Movies Found</Text>
      <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <FlatList
        data={displayMovies}
        keyExtractor={(item, index) => `movie-${item.id}-${index}`}
        renderItem={renderMovieItem}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={loading ? <LoadingSpinner style={styles.loader} /> : null}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onLanguageToggle={handleLanguageToggle}
        showModal={showLanguageModal}
        onCloseModal={() => setShowLanguageModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120, // Add extra padding for tab bar
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  languageFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignSelf: 'flex-start',
  },
  languageFilterText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  noMoodContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noMoodText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  puzzleButton: {
    paddingHorizontal: 24,
  },
  movieWrapper: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 16,
  },
  movieWrapperRight: {
    paddingLeft: 10,
    paddingRight: 20,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loader: {
    marginVertical: 20,
  },
});
