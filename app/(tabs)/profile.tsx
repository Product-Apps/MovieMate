// app/(tabs)/profile.tsx (Fixed - Editable Profile, Remove Theme)
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useMovieStore } from '@/store/useMovieStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 
  'France', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Spain', 'Italy', 
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Other'
];

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, settings, updateProfile, updateSettings } = useSettingsStore();
  const { favorites, clearFavorites, getFavoriteCount } = useFavoriteStore();
  const { resetPuzzleData, currentMoodAnalysis } = useMoodStore();
  const { clearRecommendations, clearSearchResults } = useMovieStore();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    age: profile.age?.toString() || '',
    country: profile.country || '',
    favoriteGenres: profile.favoriteGenres || [],
    preferredLanguages: profile.preferredLanguages || [],
  });
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'Are you sure you want to remove all your favorite movies?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearFavorites 
        },
      ]
    );
  };

  const handleResetMoodData = () => {
    Alert.alert(
      'Reset Mood Data',
      'This will clear your mood analysis and puzzle responses. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetPuzzleData();
            clearRecommendations();
            clearSearchResults();
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (isEditingProfile) {
      // Save changes
      const updatedProfile = {
        ...editedProfile,
        age: editedProfile.age ? parseInt(editedProfile.age, 10) : null,
      };
      updateProfile(updatedProfile);
    } else {
      // Start editing
      setEditedProfile({
        name: profile.name || '',
        bio: profile.bio || '',
        age: profile.age?.toString() || '',
        country: profile.country || '',
        favoriteGenres: profile.favoriteGenres || [],
        preferredLanguages: profile.preferredLanguages || [],
      });
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleGenreToggle = (genre) => {
    setEditedProfile(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleLanguageToggle = (languageCode) => {
    setEditedProfile(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(languageCode)
        ? prev.preferredLanguages.filter(l => l !== languageCode)
        : [...prev.preferredLanguages, languageCode]
    }));
  };

  const handleNavigateToFavorites = () => {
    router.push('/favorites');
  };

  const profileStats = [
    { 
      label: 'Favorites', 
      value: getFavoriteCount(), 
      icon: 'heart',
      color: '#FF3B30',
      onPress: handleNavigateToFavorites 
    },
    { 
      label: 'Current Mood', 
      value: currentMoodAnalysis 
        ? currentMoodAnalysis.primaryMood.charAt(0).toUpperCase() + currentMoodAnalysis.primaryMood.slice(1)
        : 'Unknown', 
      icon: 'happy',
      color: '#007AFF' 
    },
    { 
      label: 'App Version', 
      value: settings.version || '1.0.0', 
      icon: 'information-circle',
      color: '#666' 
    },
  ];

  const settingsOptions = [
    {
      title: 'Notifications',
      description: 'Receive app notifications',
      type: 'switch',
      value: settings.notifications ?? true,
      onValueChange: (value: boolean) => updateSettings({ notifications: value }),
    },
    {
      title: 'Auto Play Trailers',
      description: 'Automatically play movie trailers',
      type: 'switch',
      value: settings.autoPlay ?? false,
      onValueChange: (value: boolean) => updateSettings({ autoPlay: value }),
    },
  ];

  const renderGenreModal = () => (
    <Modal
      visible={showGenreModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowGenreModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Favorite Genres</Text>
          <TouchableOpacity onPress={() => setShowGenreModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={styles.modalOption}
              onPress={() => handleGenreToggle(genre)}
            >
              <Text style={styles.modalOptionText}>{genre}</Text>
              {editedProfile.favoriteGenres.includes(genre) && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Preferred Languages</Text>
          <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={styles.modalOption}
              onPress={() => handleLanguageToggle(language.code)}
            >
              <Text style={styles.modalOptionText}>{language.name}</Text>
              {editedProfile.preferredLanguages.includes(language.code) && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderCountryModal = () => (
    <Modal
      visible={showCountryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCountryModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Country</Text>
          <TouchableOpacity onPress={() => setShowCountryModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country}
              style={styles.modalOption}
              onPress={() => {
                setEditedProfile(prev => ({ ...prev, country }));
                setShowCountryModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>{country}</Text>
              {editedProfile.country === country && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#007AFF" />
          </View>
          {isEditingProfile ? (
            <TextInput
              style={styles.editInput}
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.nameText}>
              {profile.name || 'Movie Lover'}
            </Text>
          )}
          {isEditingProfile ? (
            <TextInput
              style={[styles.editInput, styles.bioInput]}
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself"
              multiline
            />
          ) : (
            <Text style={styles.emailText}>
              {profile.bio || 'Discovering great movies every day'}
            </Text>
          )}
          <Button
            title={isEditingProfile ? 'Save Profile' : 'Edit Profile'}
            variant="outline"
            onPress={handleEditProfile}
            style={styles.editButton}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={stat.onPress}
              disabled={!stat.onPress}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            {isEditingProfile ? (
              <TextInput
                style={styles.inlineEditInput}
                value={editedProfile.age}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, age: text }))}
                placeholder="Age"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.age || 'Not set'}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.infoRow} 
            onPress={() => isEditingProfile && setShowCountryModal(true)}
            disabled={!isEditingProfile}
          >
            <Text style={styles.infoLabel}>Country</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {isEditingProfile ? editedProfile.country || 'Select Country' : profile.country || 'Not set'}
              </Text>
              {isEditingProfile && (
                <Ionicons name="chevron-forward" size={16} color="#666" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => isEditingProfile && setShowGenreModal(true)}
            disabled={!isEditingProfile}
          >
            <Text style={styles.infoLabel}>Favorite Genres</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {(isEditingProfile ? editedProfile.favoriteGenres : profile.favoriteGenres)?.length > 0
                  ? `${(isEditingProfile ? editedProfile.favoriteGenres : profile.favoriteGenres).length} selected`
                  : 'Not set'
                }
              </Text>
              {isEditingProfile && (
                <Ionicons name="chevron-forward" size={16} color="#666" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => isEditingProfile && setShowLanguageModal(true)}
            disabled={!isEditingProfile}
          >
            <Text style={styles.infoLabel}>Preferred Languages</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {(isEditingProfile ? editedProfile.preferredLanguages : profile.preferredLanguages)?.length > 0
                  ? `${(isEditingProfile ? editedProfile.preferredLanguages : profile.preferredLanguages).length} selected`
                  : 'Not set'
                }
              </Text>
              {isEditingProfile && (
                <Ionicons name="chevron-forward" size={16} color="#666" />
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {/* Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsOptions.map((option, index) => (
            <View key={index} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
              <Switch
                value={option.value as boolean}
                onValueChange={option.onValueChange}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor="#f4f3f4"
              />
            </View>
          ))}
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearFavorites}>
            <Ionicons name="heart-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>
              Clear Favorites ({getFavoriteCount()})
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FF3B30" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleResetMoodData}>
            <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>
              Reset Mood Data
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </Card>

        {/* Recent Favorites */}
        {safeFavorites.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Favorites</Text>
            {safeFavorites.slice(0, 3).map((movie, index) => (
              <View key={movie.id || index} style={styles.favoriteRow}>
                <Text style={styles.favoriteTitle} numberOfLines={1}>
                  {movie.title || 'Unknown Movie'}
                </Text>
                <Text style={styles.favoriteYear}>{movie.year || 'N/A'}</Text>
              </View>
            ))}
            <Button
              title="View All Favorites"
              variant="outline"
              onPress={handleNavigateToFavorites}
              style={styles.viewAllButton}
            />
          </Card>
        )}
      </ScrollView>

      {renderGenreModal()}
      {renderLanguageModal()}
      {renderCountryModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    textAlign: 'center',
    minWidth: 200,
  },
  bioInput: {
    fontSize: 16,
    fontWeight: 'normal',
    minHeight: 60,
    textAlign: 'center',
  },
  inlineEditInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: 'right',
  },
  editButton: {
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  favoriteTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  favoriteYear: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  viewAllButton: {
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
});
