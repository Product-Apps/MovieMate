// components/movie/GenreSelector.tsx (Fixed)
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Genre } from '@/types/movie';

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
  multiSelect?: boolean;
  showModal?: boolean;
  onCloseModal?: () => void;
}

export default function GenreSelector({
  genres = [],
  selectedGenres = [],
  onGenreToggle,
  multiSelect = true,
  showModal = false,
  onCloseModal,
}: GenreSelectorProps) {
  // Ensure inputs are arrays
  const safeGenres = Array.isArray(genres) ? genres : [];
  const safeSelectedGenres = Array.isArray(selectedGenres) ? selectedGenres : [];

  const handleGenrePress = (genreId: number) => {
    if (typeof onGenreToggle === 'function') {
      onGenreToggle(genreId);
    }
  };

  const isGenreSelected = (genreId: number): boolean => {
    return safeSelectedGenres.includes(genreId);
  };

  const renderGenreItem = (genre: Genre) => {
    if (!genre || typeof genre.id !== 'number') return null;
    
    const isSelected = isGenreSelected(genre.id);
    
    return (
      <TouchableOpacity
        key={genre.id}
        style={[
          styles.genreChip,
          isSelected && styles.genreChipSelected,
        ]}
        onPress={() => handleGenrePress(genre.id)}
      >
        <Text style={[
          styles.genreText,
          isSelected && styles.genreTextSelected,
        ]}>
          {genre.name || 'Unknown Genre'}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color="#fff"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  const content = (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.genresContainer}>
          {safeGenres.map(renderGenreItem)}
        </View>
      </ScrollView>
    </View>
  );

  if (showModal) {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Genres</Text>
            <TouchableOpacity
              onPress={onCloseModal}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  genreChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  genreTextSelected: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
});
