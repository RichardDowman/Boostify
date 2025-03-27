import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, Pressable } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Music2, TrendingUp, Star, Search, Lock, Heart, DollarSign } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';

// Helper function to normalize song names for comparison
const normalizeSongName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/['"']/g, '') // Remove quotes and apostrophes
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

type Song = {
  id: number;
  name: string;
  tips: number;
  requestedBy: string;
  boostedBy: string[];
  status: 'playing' | 'pending';
  reserveAmount?: number;
  currentTips?: number;
};

export default function QueueScreen() {
  const params = useLocalSearchParams();
  const [songQueue, setSongQueue] = useState<Song[]>([
    { 
      id: 1, 
      name: "Sweet Child O' Mine", 
      tips: 25, 
      requestedBy: 'other', 
      boostedBy: ['user2', 'user3'], 
      status: 'playing',
      reserveAmount: 50,
      currentTips: 35
    },
    { 
      id: 2, 
      name: "Bohemian Rhapsody", 
      tips: 18, 
      requestedBy: 'other', 
      boostedBy: ['user4'], 
      status: 'pending',
      reserveAmount: 75,
      currentTips: 25
    },
    { 
      id: 3, 
      name: "Hotel California", 
      tips: 15, 
      requestedBy: 'other', 
      boostedBy: [], 
      status: 'pending' 
    },
    { 
      id: 4, 
      name: "Stairway to Heaven", 
      tips: 12, 
      requestedBy: 'current_user', 
      boostedBy: [], 
      status: 'pending',
      reserveAmount: 100,
      currentTips: 12
    }
  ]);
  const [songRequest, setSongRequest] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // In a real app, this would come from authentication
  const currentUserId = 'current_user';

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Filter songs based on input
  const suggestions = songQueue
    .filter(song => 
      song.status === 'pending' &&
      normalizeSongName(song.name).includes(normalizeSongName(songRequest)) &&
      normalizeSongName(song.name) !== normalizeSongName(songRequest)
    )
    .slice(0, 3); // Limit to 3 suggestions

  if (!fontsLoaded) {
    return null;
  }

  const handleBoostSong = (songId: number) => {
    const song = songQueue.find(s => s.id === songId);
    if (!song) return;

    const boostAmount = 2;
    const updatedQueue = songQueue.map(song => {
      if (song.id === songId) {
        const newTips = song.tips + boostAmount;
        const newCurrentTips = (song.currentTips || 0) + boostAmount;
        return {
          ...song,
          tips: newTips,
          currentTips: newCurrentTips,
          boostedBy: [...(song.boostedBy || []), currentUserId]
        };
      }
      return song;
    });

    setSongQueue(updatedQueue.sort((a, b) => {
      // First sort by reserve status (unlocked songs first)
      const aUnlocked = !a.reserveAmount || (a.currentTips || 0) >= (a.reserveAmount || 0);
      const bUnlocked = !b.reserveAmount || (b.currentTips || 0) >= (b.reserveAmount || 0);
      if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
      
      // Then sort by tips
      return b.tips - a.tips;
    }));
  };

  const handleRequestSong = () => {
    if (!songRequest.trim()) return;
    
    const normalizedRequest = normalizeSongName(songRequest);
    const existingSong = songQueue.find(
      song => normalizeSongName(song.name) === normalizedRequest
    );

    const requestAmount = Number(params.minimumRequestAmount) || 5;

    if (existingSong) {
      Alert.alert(
        'Song Already Requested',
        'This song is already in the queue. Would you like to boost it?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Boost ($2)',
            onPress: () => handleBoostSong(existingSong.id),
          },
        ]
      );
      setSongRequest('');
      setShowSuggestions(false);
      return;
    }

    const newSong = {
      id: Math.max(...songQueue.map(s => s.id)) + 1,
      name: songRequest.trim(),
      tips: requestAmount,
      requestedBy: currentUserId,
      boostedBy: [],
      status: 'pending',
      currentTips: requestAmount
    };

    setSongQueue([...songQueue, newSong].sort((a, b) => b.tips - a.tips));
    setSongRequest('');
    setShowSuggestions(false);
  };

  const handleSuggestionPress = (songName: string) => {
    setSongRequest(songName);
    setShowSuggestions(false);
  };

  const isUserSong = (song: Song) => {
    return song.requestedBy === currentUserId || song.boostedBy.includes(currentUserId);
  };

  const renderReserveStatus = (song: Song) => {
    if (!song.reserveAmount) return null;

    const progress = ((song.currentTips || 0) / song.reserveAmount) * 100;
    const isUnlocked = (song.currentTips || 0) >= song.reserveAmount;

    return (
      <View style={styles.reserveContainer}>
        <View style={styles.reserveHeader}>
          <Lock color={isUnlocked ? "#10b981" : "#4a9eff"} size={16} />
          <Text style={[styles.reserveText, isUnlocked && styles.reserveTextUnlocked]}>
            {isUnlocked ? 'Reserve Met!' : `Reserve of $${song.reserveAmount} not met`}
          </Text>
        </View>
        <View style={styles.reserveProgressBar}>
          <View 
            style={[
              styles.reserveProgress, 
              { width: `${progress}%` },
              isUnlocked && styles.reserveProgressUnlocked
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderNowPlaying = () => {
    const currentSong = songQueue.find(song => song.status === 'playing');
    if (!currentSong) return null;

    return (
      <View style={styles.nowPlayingContainer}>
        <View style={styles.nowPlayingContent}>
          <View style={styles.nowPlayingRow}>
            <View style={styles.nowPlayingInfo}>
              <View style={styles.nowPlayingBadge}>
                <Music2 color="#4a9eff" size={16} />
                <Text style={styles.nowPlayingLabel}>Now Playing</Text>
              </View>
              <Text style={styles.nowPlayingSong}>{currentSong.name}</Text>
            </View>
            <View style={styles.tipsContainer}>
              <Heart color="#e11d48" size={16} fill="#e11d48" />
              <Text style={styles.tipsText}>${currentSong.tips}</Text>
            </View>
          </View>
          {renderReserveStatus(currentSong)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(45, 27, 78, 0.85)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Song Queue</Text>
          <Text style={styles.venue}>The Blue Note • Live Now</Text>
        </View>

        {renderNowPlaying()}

        <View style={styles.mainContent}>
          <View style={styles.inputContainer}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                value={songRequest}
                onChangeText={(text) => {
                  setSongRequest(text);
                  setShowSuggestions(true);
                }}
                placeholder="Request a song..."
                placeholderTextColor="#666"
                onFocus={() => setShowSuggestions(true)}
              />
              <Search color="#666" size={20} style={styles.searchIcon} />
            </View>
            
            {showSuggestions && suggestions.length > 0 && (
              <Animated.View 
                entering={FadeIn}
                style={styles.suggestionsContainer}
              >
                {suggestions.map((song) => (
                  <Pressable
                    key={song.id}
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      pressed && styles.suggestionItemPressed
                    ]}
                    onPress={() => handleSuggestionPress(song.name)}
                  >
                    <Text style={styles.suggestionText}>{song.name}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            )}

            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestSong}>
              <Music2 color="#fff" size={24} />
              <Text style={styles.buttonText}>
                Request (${params.minimumRequestAmount || 5})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.queueWrapper}>
            <ScrollView style={styles.queueContainer}>
              {songQueue
                .filter(song => song.status === 'pending')
                .map((song, index) => {
                  const userInteracted = isUserSong(song);
                  const isReserved = song.reserveAmount && (song.currentTips || 0) < song.reserveAmount;
                  
                  return (
                    <Animated.View
                      key={song.id}
                      entering={FadeInUp.delay(index * 100)}
                      style={[
                        styles.songCard,
                        userInteracted && styles.userSongCard,
                        isReserved && styles.reservedSongCard
                      ]}>
                      <View style={styles.songInfo}>
                        <View style={styles.songNameContainer}>
                          <Text style={styles.songName}>{song.name}</Text>
                          {userInteracted && (
                            <Star
                              size={16}
                              color="#fbbf24"
                              fill="#fbbf24"
                              style={styles.starIcon}
                            />
                          )}
                        </View>
                        <Text style={styles.tipAmount}>${song.tips}</Text>
                      </View>

                      {renderReserveStatus(song)}

                      <TouchableOpacity
                        style={[
                          styles.boostButton,
                          song.boostedBy.includes(currentUserId) && styles.boostedButton,
                          isReserved && styles.unlockButton
                        ]}
                        onPress={() => handleBoostSong(song.id)}>
                        {isReserved ? (
                          <>
                            <Lock color="#fff" size={20} />
                            <Text style={styles.boostText}>Boost to Unlock ($2)</Text>
                          </>
                        ) : (
                          <>
                            <TrendingUp color="#fff" size={20} />
                            <Text style={styles.boostText}>
                              {song.boostedBy.includes(currentUserId) ? 'Boosted' : 'Boost ($2)'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  venue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4a9eff',
    textAlign: 'center',
  },
  nowPlayingContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  nowPlayingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nowPlayingInfo: {
    flex: 1,
    marginRight: 12,
  },
  nowPlayingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nowPlayingLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4a9eff',
  },
  nowPlayingSong: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  tipsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#e11d48',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  searchIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    paddingRight: 45,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a0b2e',
  },
  requestButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 10,
  },
  queueWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  queueContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  songCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  userSongCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  reservedSongCard: {
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.3)',
  },
  songInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  songNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  starIcon: {
    marginLeft: 8,
  },
  tipAmount: {
    color: '#10b981',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  reserveContainer: {
    marginBottom: 10,
  },
  reserveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reserveText: {
    color: '#4a9eff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  reserveTextUnlocked: {
    color: '#10b981',
  },
  reserveProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  reserveProgress: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 2,
  },
  reserveProgressUnlocked: {
    backgroundColor: '#10b981',
  },
  boostButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostedButton: {
    backgroundColor: '#4338ca',
  },
  unlockButton: {
    backgroundColor: '#4a9eff',
  },
  boostText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 5,
  },
});