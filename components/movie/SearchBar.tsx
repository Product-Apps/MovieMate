// components/movie/SearchBar.tsx (Fixed)
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search movies...',
  value = '',
  onChangeText,
  autoFocus = false,
  onFocus,
  onBlur,
  debounceMs = 500,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    if (typeof value === 'string' && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof onSearch === 'function' && searchQuery.trim() !== value?.trim()) {
        onSearch(searchQuery.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debounceMs]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleChangeText = (text: string) => {
    const safeText = typeof text === 'string' ? text : '';
    setSearchQuery(safeText);
    if (typeof onChangeText === 'function') {
      onChangeText(safeText);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (typeof onFocus === 'function') {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (typeof onBlur === 'function') {
      onBlur();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (typeof onChangeText === 'function') {
      onChangeText('');
    }
    if (typeof onSearch === 'function') {
      onSearch('');
    }
  };

  const handleSearchPress = () => {
    if (typeof onSearch === 'function') {
      onSearch(searchQuery.trim());
    }
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#007AFF'],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? '#007AFF' : '#666'}
        style={styles.searchIcon}
      />
      
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
      />

      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default padding on iOS
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
