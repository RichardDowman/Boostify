import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Music2, Plus, X, Upload, TrendingUp, Trash2, DollarSign, ChevronRight, Check } from 'lucide-react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';

type Song = {
  id: number;
  title: string;
  artist?: string;
  basePrice: number;
  boostHistory?: {
    totalBoosts: number;
    totalAmount: number;
    lastBoost?: string;
  };
  suggestedPrice?: number;
  popularityScore?: number;
};

type Playlist = {
  id: number;
  name: string;
  songs: Song[];
  createdAt: string;
  lastUsed?: string;
};

type PriceSuggestion = {
  songId: number;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  isAcknowledged: boolean;
};

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 1,
      name: "Rock Classics",
      songs: [
        { 
          id: 1, 
          title: "Sweet Child O' Mine", 
          artist: "Guns N' Roses", 
          basePrice: 10,
          boostHistory: {
            totalBoosts: 25,
            totalAmount: 250,
            lastBoost: "2025-02-15"
          },
          suggestedPrice: 15,
          popularityScore: 85
        },
        { 
          id: 2, 
          title: "Stairway to Heaven", 
          artist: "Led Zeppelin", 
          basePrice: 15,
          boostHistory: {
            totalBoosts: 15,
            totalAmount: 150,
            lastBoost: "2025-02-14"
          },
          popularityScore: 65
        },
      ],
      createdAt: "2025-02-10",
      lastUsed: "2025-02-15"
    }
  ]);

  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    basePrice: 5
  });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [priceSuggestions] = useState<PriceSuggestion[]>([
    {
      songId: 1,
      currentPrice: 10,
      suggestedPrice: 15,
      reason: "High boost activity in recent events",
      isAcknowledged: false
    }
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    const newPlaylist: Playlist = {
      id: Math.max(...playlists.map(p => p.id), 0) + 1,
      name: newPlaylistName,
      songs: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylistModal(false);
  };

  const handleAddSong = () => {
    if (!selectedPlaylist) return;
    if (!newSong.title.trim()) {
      Alert.alert('Error', 'Please enter a song title');
      return;
    }

    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === selectedPlaylist.id) {
        return {
          ...playlist,
          songs: [
            ...playlist.songs,
            {
              id: Math.max(...playlist.songs.map(s => s.id), 0) + 1,
              title: newSong.title,
              artist: newSong.artist,
              basePrice: newSong.basePrice,
              boostHistory: {
                totalBoosts: 0,
                totalAmount: 0
              },
              popularityScore: 0
            }
          ]
        };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    setNewSong({ title: '', artist: '', basePrice: 5 });
    setShowAddSongModal(false);
  };

  const handleApplySuggestion = (songId: number, suggestedPrice: number) => {
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      songs: playlist.songs.map(song => 
        song.id === songId
          ? { ...song, basePrice: suggestedPrice, suggestedPrice: undefined }
          : song
      )
    }));

    setPlaylists(updatedPlaylists);
    Alert.alert('Success', 'Price updated successfully');
  };

  const handleDismissSuggestion = (songId: number) => {
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      songs: playlist.songs.map(song => 
        song.id === songId
          ? { ...song, suggestedPrice: undefined }
          : song
      )
    }));

    setPlaylists(updatedPlaylists);
  };

  const renderPopularityIndicator = (score?: number) => {
    if (!score) return null;

    let color = '#ef4444'; // red
    if (score >= 70) color = '#10b981'; // green
    else if (score >= 40) color = '#f59e0b'; // yellow

    return (
      <View style={[styles.popularityIndicator, { backgroundColor: color }]}>
        <Text style={styles.popularityScore}>{score}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(26, 11, 46, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>My Playlists</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.suggestionsButton]}
            onPress={() => setShowSuggestionsModal(true)}
          >
            <TrendingUp color="#fff" size={20} />
            <Text style={styles.headerButtonText}>Suggestions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreatePlaylistModal(true)}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {playlists.map((playlist, index) => (
          <Animated.View
            key={playlist.id}
            entering={FadeInRight.delay(index * 100)}
            style={styles.playlistCard}
          >
            <View style={styles.playlistHeader}>
              <View>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistInfo}>
                  {playlist.songs.length} songs • Created {playlist.createdAt}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {
                  setSelectedPlaylist(playlist);
                  handleUploadFile();
                }}
              >
                <Upload color="#fff" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.songList}>
              {playlist.songs.map(song => (
                <View key={song.id} style={styles.songItem}>
                  <View style={styles.songInfo}>
                    <Music2 color="#4a9eff" size={20} />
                    <View style={styles.songDetails}>
                      <View style={styles.songTitleRow}>
                        <Text style={styles.songTitle}>{song.title}</Text>
                        {renderPopularityIndicator(song.popularityScore)}
                      </View>
                      {song.artist && (
                        <Text style={styles.songArtist}>{song.artist}</Text>
                      )}
                      {song.boostHistory && (
                        <View style={styles.boostInfo}>
                          <Text style={styles.boostText}>
                            {song.boostHistory.totalBoosts} boosts • ${song.boostHistory.totalAmount} earned
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.songActions}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.basePrice}>${song.basePrice}</Text>
                      {song.suggestedPrice && (
                        <View style={styles.suggestedPriceTag}>
                          <TrendingUp color="#10b981" size={12} />
                          <Text style={styles.suggestedPriceText}>
                            ${song.suggestedPrice}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addSongButton}
              onPress={() => {
                setSelectedPlaylist(playlist);
                setShowAddSongModal(true);
              }}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.addSongButtonText}>Add Song</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Price Suggestions Modal */}
      <Modal
        visible={showSuggestionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Price Suggestions</Text>
              <TouchableOpacity
                onPress={() => setShowSuggestionsModal(false)}
                style={styles.modalClose}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.suggestionsList}>
              {playlists.flatMap(playlist => 
                playlist.songs
                  .filter(song => song.suggestedPrice)
                  .map(song => (
                    <View key={song.id} style={styles.suggestionCard}>
                      <View style={styles.suggestionHeader}>
                        <Text style={styles.suggestionTitle}>{song.title}</Text>
                        <View style={styles.suggestionPrices}>
                          <Text style={styles.currentPrice}>${song.basePrice}</Text>
                          <ChevronRight color="#4a9eff" size={16} />
                          <Text style={styles.suggestedPrice}>${song.suggestedPrice}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.suggestionReason}>
                        Popular song with high boost activity
                      </Text>

                      <View style={styles.suggestionStats}>
                        <View style={styles.statItem}>
                          <TrendingUp color="#4a9eff" size={16} />
                          <Text style={styles.statText}>
                            {song.boostHistory?.totalBoosts} boosts
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <DollarSign color="#4a9eff" size={16} />
                          <Text style={styles.statText}>
                            ${song.boostHistory?.totalAmount} earned
                          </Text>
                        </View>
                      </View>

                      <View style={styles.suggestionActions}>
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => {
                            handleApplySuggestion(song.id, song.suggestedPrice!);
                            setShowSuggestionsModal(false);
                          }}
                        >
                          <Check color="#fff" size={20} />
                          <Text style={styles.actionButtonText}>Apply</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.dismissButton}
                          onPress={() => {
                            handleDismissSuggestion(song.id);
                            setShowSuggestionsModal(false);
                          }}
                        >
                          <X color="#fff" size={20} />
                          <Text style={styles.actionButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}

              {!playlists.some(p => p.songs.some(s => s.suggestedPrice)) && (
                <View style={styles.noSuggestionsContainer}>
                  <Text style={styles.noSuggestionsText}>
                    No price suggestions available
                  </Text>
                  <Text style={styles.noSuggestionsSubtext}>
                    Suggestions will appear here when we detect opportunities to optimize your pricing
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Add Song Modal */}
      <Modal
        visible={showAddSongModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddSongModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Song</Text>
              <TouchableOpacity
                onPress={() => setShowAddSongModal(false)}
                style={styles.modalClose}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Song Title</Text>
              <TextInput
                style={styles.input}
                value={newSong.title}
                onChangeText={(text) => setNewSong(prev => ({ ...prev, title: text }))}
                placeholder="Enter song title"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Artist (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newSong.artist}
                onChangeText={(text) => setNewSong(prev => ({ ...prev, artist: text }))}
                placeholder="Enter artist name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Base Price ($)</Text>
              <View style={styles.priceContainer}>
                {[5, 10, 15, 20].map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceOption,
                      newSong.basePrice === price && styles.priceOptionSelected
                    ]}
                    onPress={() => setNewSong(prev => ({ ...prev, basePrice: price }))}
                  >
                    <Text style={[
                      styles.priceOptionText,
                      newSong.basePrice === price && styles.priceOptionTextSelected
                    ]}>
                      ${price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddSong}
            >
              <Text style={styles.saveButtonText}>Add Song</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreatePlaylistModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreatePlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Playlist</Text>
              <TouchableOpacity
                onPress={() => setShowCreatePlaylistModal(false)}
                style={styles.modalClose}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Playlist Name</Text>
              <TextInput
                style={styles.input}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                placeholder="Enter playlist name"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreatePlaylist}
            >
              <Text style={styles.saveButtonText}>Create Playlist</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  suggestionsButton: {
    backgroundColor: '#10b981',
  },
  headerButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  playlistName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  playlistInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
  },
  uploadButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songList: {
    marginBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  songDetails: {
    marginLeft: 12,
    flex: 1,
  },
  songTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  songTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  songArtist: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
  },
  boostInfo: {
    marginTop: 4,
  },
  boostText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4a9eff',
  },
  songActions: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  basePrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#10b981',
  },
  suggestedPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
    gap: 4,
  },
  suggestedPriceText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#10b981',
  },
  popularityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  popularityScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#fff',
  },
  addSongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  addSongButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a0b2e',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
  },
  modalClose: {
    padding: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  suggestionPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  suggestedPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#10b981',
  },
  suggestionReason: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
    marginBottom: 12,
  },
  suggestionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dismissButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },
  noSuggestionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  noSuggestionsSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  priceOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  priceOptionSelected: {
    backgroundColor: '#10b981',
  },
  priceOptionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  priceOptionTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 16,
  },
});