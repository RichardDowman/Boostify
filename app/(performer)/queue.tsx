import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Music2, Check, X, DollarSign, Clock, Lock } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';

type Song = {
  id: number;
  name: string;
  tips: number;
  status: 'pending' | 'playing';
  reserveAmount?: number;
  currentTips?: number;
};

export default function PerformerQueueScreen() {
  const params = useLocalSearchParams();
  const requestsOpen = params.requestsOpen === 'true';
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [reserveAmount, setReserveAmount] = useState('');
  
  const [songQueue, setSongQueue] = useState<Song[]>([
    { 
      id: 1, 
      name: 'Sweet Child O\' Mine', 
      tips: 15, 
      status: 'pending',
      reserveAmount: 50,
      currentTips: 35
    },
    { 
      id: 2, 
      name: 'Bohemian Rhapsody', 
      tips: 12, 
      status: 'pending',
      reserveAmount: 75,
      currentTips: 25
    },
    { 
      id: 3, 
      name: 'Hotel California', 
      tips: 8, 
      status: 'pending' 
    },
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAccept = (songId: number) => {
    Alert.alert(
      'Complete Song',
      'Mark this song as played?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Complete',
          onPress: () => {
            setSongQueue(prevQueue => prevQueue.filter(song => song.id !== songId));
          }
        }
      ]
    );
  };

  const handleReject = (songId: number) => {
    Alert.alert(
      'Reject Song',
      'Are you sure you want to reject this song request?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setSongQueue(prevQueue => prevQueue.filter(song => song.id !== songId));
          }
        }
      ]
    );
  };

  const handleSetReserve = (song: Song) => {
    setSelectedSong(song);
    setReserveAmount(song.reserveAmount?.toString() || '');
    setShowReserveModal(true);
  };

  const handleSaveReserve = () => {
    if (!selectedSong) return;

    const amount = Number(reserveAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid reserve amount');
      return;
    }

    setSongQueue(prevQueue =>
      prevQueue.map(song =>
        song.id === selectedSong.id
          ? { ...song, reserveAmount: amount, currentTips: song.currentTips || 0 }
          : song
      )
    );

    setShowReserveModal(false);
    setSelectedSong(null);
    setReserveAmount('');
  };

  const pendingCount = songQueue.length;
  const totalTips = songQueue.reduce((sum, song) => sum + song.tips, 0);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(26, 11, 46, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Song Requests</Text>
          <View style={[
            styles.statusBadge,
            requestsOpen ? styles.statusBadgeActive : styles.statusBadgeInactive
          ]}>
            <View style={[
              styles.statusIndicator,
              requestsOpen ? styles.statusIndicatorActive : styles.statusIndicatorInactive
            ]} />
            <Text style={styles.statusText}>
              {requestsOpen ? 'Accepting Requests' : 'Requests Closed'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <DollarSign color="#4a9eff" size={24} />
            <Text style={styles.statValue}>${totalTips}</Text>
            <Text style={styles.statLabel}>Total Tips</Text>
          </View>
          <View style={styles.statItem}>
            <Music2 color="#4a9eff" size={24} />
            <Text style={styles.statValue}>${Math.round(totalTips * 0.8)}</Text>
            <Text style={styles.statLabel}>Direct Tips</Text>
          </View>
          <View style={styles.statItem}>
            <Clock color="#4a9eff" size={24} />
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.queueContainer}>
        {!requestsOpen ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Song requests are currently closed
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Open requests from the event details page to start accepting song requests
            </Text>
          </View>
        ) : songQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No song requests yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Requests will appear here when users submit them
            </Text>
          </View>
        ) : (
          songQueue.map((song, index) => (
            <Animated.View
              key={song.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.songCard}>
              <View style={styles.songInfo}>
                <View style={styles.songDetails}>
                  <View style={styles.songHeader}>
                    <Music2 color="#4a9eff" size={24} />
                    <View style={styles.songTitleContainer}>
                      <Text style={styles.songName}>{song.name}</Text>
                      <Text style={styles.tipAmount}>${song.tips} in tips</Text>
                    </View>
                  </View>
                  
                  {song.reserveAmount && (
                    <View style={styles.reserveContainer}>
                      <Lock color="#4a9eff" size={16} />
                      <Text style={styles.reserveText}>
                        Reserve: ${song.currentTips} / ${song.reserveAmount}
                      </Text>
                      <View style={styles.reserveProgress}>
                        <View 
                          style={[
                            styles.reserveProgressBar,
                            { width: `${(song.currentTips! / song.reserveAmount) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.reserveButton]}
                  onPress={() => handleSetReserve(song)}>
                  <Lock color="#fff" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(song.id)}>
                  <Check color="#fff" size={20} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(song.id)}>
                  <X color="#fff" size={20} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showReserveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReserveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Reserve Amount</Text>
              <TouchableOpacity
                onPress={() => setShowReserveModal(false)}
                style={styles.modalClose}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            {selectedSong && (
              <Text style={styles.modalSongName}>{selectedSong.name}</Text>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reserve Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={reserveAmount}
                onChangeText={setReserveAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveReserve}
            >
              <Text style={styles.saveButtonText}>Save Reserve Amount</Text>
            </TouchableOpacity>
          </View>
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
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  header: {
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIndicatorActive: {
    backgroundColor: '#10b981',
  },
  statusIndicatorInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4a9eff',
    marginTop: 2,
  },
  queueContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  songDetails: {
    flex: 1,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  songTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  songName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  tipAmount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#10b981',
  },
  reserveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  reserveText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4a9eff',
  },
  reserveProgress: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  reserveProgressBar: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  reserveButton: {
    backgroundColor: '#6366f1',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  modalSongName: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4a9eff',
    marginBottom: 20,
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