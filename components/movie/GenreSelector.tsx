// components/movie/GenreSelector.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { GENRES } from '@/constants/Languages';

interface GenreSelectorProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  visible: boolean;
  onClose: () => void;
}

export default function GenreSelector({
  selectedGenres,
  onGenresChange,
  visible,
  onClose,
}: GenreSelectorProps) {
  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter((g) => g !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  const selectAll = () => {
    onGenresChange(GENRES.map((g) => g.id));
  };

  const clearAll = () => {
    onGenresChange([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Genres</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={selectAll} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Select All</Text>
          </Pressable>
          <Pressable onPress={clearAll} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Clear All</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.genresList} showsVerticalScrollIndicator={false}>
          <View style={styles.genreGrid}>
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre.id);
              return (
                <Pressable
                  key={genre.id}
                  style={[styles.genreChip, isSelected && styles.selectedGenreChip]}
                  onPress={() => toggleGenre(genre.id)}
                >
                  <Text style={[styles.genreText, isSelected && styles.selectedGenreText]}>
                    {genre.name}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.selectedCount}>
            {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  genresList: {
    flex: 1,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedGenreChip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  genreText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedGenreText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});