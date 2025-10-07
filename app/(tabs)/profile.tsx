// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  Pressable, 
  Switch, 
  TextInput, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, Gender } from '@/store/useSettingsStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    profile, 
    darkMode, 
    notifications, 
    ageRestrictions, 
    adultContent,
    updateProfile, 
    setDarkMode, 
    setNotifications, 
    setAgeRestrictions,
    setAdultContent,
    resetSettings 
  } = useSettingsStore();
  const { favorites, clearFavorites, getFavoriteCount } = useFavoriteStore();
  const { currentMoodAnalysis, resetPuzzleData } = useMoodStore();

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleSaveProfile = () => {
    updateProfile(tempProfile);
    setEditMode(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your favorites, mood history, and reset your profile. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearFavorites();
            resetPuzzleData();
            resetSettings();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const getAgeGroup = (age: number) => {
    if (age < 13) return 'Child';
    if (age < 18) return 'Teen';
    if (age < 65) return 'Adult';
    return 'Senior';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile & Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Pressable 
            style={styles.editButton}
            onPress={() => editMode ? handleSaveProfile() : setEditMode(true)}
          >
            <Ionicons 
              name={editMode ? 'checkmark' : 'create'} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.editButtonText}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            {editMode ? (
              <TextInput
                style={styles.textInput}
                value={tempProfile.name}
                onChangeText={(text) => setTempProfile({...tempProfile, name: text})}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.inputValue}>
                {profile.name || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            {editMode ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tempProfile.gender}
                  onValueChange={(value: Gender) => 
                    setTempProfile({...tempProfile, gender: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                  <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
                </Picker>
              </View>
            ) : (
              <Text style={styles.inputValue}>
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace(/-/g, ' ')}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            {editMode ? (
              <TextInput
                style={styles.textInput}
                value={tempProfile.age.toString()}
                onChangeText={(text) => 
                  setTempProfile({...tempProfile, age: parseInt(text) || 18})
                }
                keyboardType="numeric"
                placeholder="Enter your age"
              />
            ) : (
              <View style={styles.ageContainer}>
                <Text style={styles.inputValue}>{profile.age} years old</Text>
                <Text style={styles.ageGroup}>({getAgeGroup(profile.age)})</Text>
              </View>
            )}
          </View>

          {editMode && (
            <View style={styles.editActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Current Mood Section */}
      {currentMoodAnalysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mood</Text>
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Text style={styles.moodType}>{currentMoodAnalysis.primaryMood}</Text>
              <Text style={styles.confidence}>
                {Math.round(currentMoodAnalysis.confidence * 100)}%
              </Text>
            </View>
            <Text style={styles.moodDescription}>
              {currentMoodAnalysis.description}
            </Text>
            {currentMoodAnalysis.secondaryMood && (
              <Text style={styles.secondaryMood}>
                Secondary: {currentMoodAnalysis.secondaryMood}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color="#FF3B30" />
            <Text style={styles.statNumber}>{getFavoriteCount()}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <Pressable 
            style={styles.statItem} 
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="film" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Movies Saved</Text>
          </Pressable>
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Dark Mode</Text>
            <Text style={styles.preferenceDescription}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Text style={styles.preferenceDescription}>
              Receive app notifications
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Age Restrictions</Text>
            <Text style={styles.preferenceDescription}>
              Filter content based on age
            </Text>
          </View>
          <Switch
            value={ageRestrictions}
            onValueChange={setAgeRestrictions}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={ageRestrictions ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {profile.age >= 18 && (
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceLabel}>Adult Content</Text>
              <Text style={styles.preferenceDescription}>
                Show mature/adult rated content
              </Text>
            </View>
            <Switch
              value={adultContent}
              onValueChange={setAdultContent}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={adultContent ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <Pressable 
          style={styles.actionButton} 
          onPress={() => router.push('/puzzles')}
        >
          <Ionicons name="extension-puzzle" size={20} color="#333" />
          <Text style={styles.actionButtonText}>🧩 Take New Mood Assessment</Text>
        </Pressable>

        <Pressable 
          style={styles.actionButton} 
          onPress={() => router.push('/movies')}
        >
          <Ionicons name="film" size={20} color="#333" />
          <Text style={styles.actionButtonText}>🎬 View Movie Recommendations</Text>
        </Pressable>

        <Pressable 
          style={styles.actionButton} 
          onPress={() => router.push('/favorites')}
        >
          <Ionicons name="heart" size={20} color="#333" />
          <Text style={styles.actionButtonText}>❤️ View My Favorites</Text>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleClearAllData}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            🗑️ Clear All Data
          </Text>
        </Pressable>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.appInfo}>
          <Text style={styles.appName}>MoodFlix v1.0.0</Text>{'\n\n'}
          AI-powered movie recommendations based on mood detection through interactive puzzles.
          {'\n\n'}
          Built with React Native and Expo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageGroup: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  moodCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  confidence: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  moodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  secondaryMood: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  appInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  appName: {
    fontWeight: 'bold',
    color: '#333',
  },
});
