// components/movie/LanguageSelector.tsx (Fixed)
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language } from '@/types/movie';

const LANGUAGES: Language[] = [
  { code: 'all', name: 'All Languages', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageToggle: (languageCode: string) => void;
  multiSelect?: boolean;
  showModal?: boolean;
  onCloseModal?: () => void;
}

export default function LanguageSelector({
  selectedLanguages = [],
  onLanguageToggle,
  multiSelect = true,
  showModal = false,
  onCloseModal,
}: LanguageSelectorProps) {
  // Ensure selectedLanguages is always an array
  const safeSelectedLanguages = Array.isArray(selectedLanguages) ? selectedLanguages : [];

  const handleLanguagePress = (languageCode: string) => {
    if (typeof onLanguageToggle === 'function') {
      onLanguageToggle(languageCode);
    }
  };

  const isLanguageSelected = (languageCode: string): boolean => {
    if (!Array.isArray(safeSelectedLanguages)) return false;
    return safeSelectedLanguages.includes(languageCode);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    if (!item || typeof item.code !== 'string') return null;
    
    const isSelected = isLanguageSelected(item.code);
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
        ]}
        onPress={() => handleLanguagePress(item.code)}
      >
        <View style={styles.languageContent}>
          <Text style={styles.languageFlag}>{item.flag || '🌐'}</Text>
          <Text style={[
            styles.languageName,
            isSelected && styles.languageNameSelected,
          ]}>
            {item.name || 'Unknown Language'}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#007AFF"
          />
        )}
      </TouchableOpacity>
    );
  };

  const content = (
    <View style={styles.container}>
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item?.code || Math.random().toString()}
        renderItem={renderLanguageItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
            <Text style={styles.modalTitle}>Select Languages</Text>
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
  listContent: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  languageItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  languageNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
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
