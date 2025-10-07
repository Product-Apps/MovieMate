// components/movie/LanguageSelector.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { Language } from '@/types/movie';
import { LANGUAGES } from '@/constants/Languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({
  selectedLanguages,
  onLanguagesChange,
  visible,
  onClose,
}: LanguageSelectorProps) {
  const toggleLanguage = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      onLanguagesChange(selectedLanguages.filter((l) => l !== languageCode));
    } else {
      onLanguagesChange([...selectedLanguages, languageCode]);
    }
  };

  const selectAll = () => {
    onLanguagesChange(LANGUAGES.map((l) => l.code));
  };

  const clearAll = () => {
    onLanguagesChange([]);
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
          <Text style={styles.title}>Select Languages</Text>
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

        <ScrollView style={styles.languagesList} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((language) => {
            const isSelected = selectedLanguages.includes(language.code);
            return (
              <Pressable
                key={language.code}
                style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
                onPress={() => toggleLanguage(language.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <Text style={[styles.languageName, isSelected && styles.selectedLanguageName]}>
                    {language.name}
                  </Text>
                </View>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.selectedCount}>
            {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
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
  languagesList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageItem: {
    backgroundColor: '#e3f2fd',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
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