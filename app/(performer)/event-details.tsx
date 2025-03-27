import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Platform, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Music2, DollarSign, Star, ArrowLeft, Users, Play, Pause, Pencil, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

type SongHistory = {
  id: number;
  name: string;
  time: string;
  tips: number;
};

type Event = {
  id: number;
  venue: string;
  date: string;
  time?: string;
  location: string;
  image: string;
  description?: string;
  attendees?: number;
  songRequests?: number;
  status?: 'active' | 'upcoming' | 'past';
  songsPlayed?: number;
  totalTips?: number;
  rating?: number;
  requestsOpen?: boolean;
  minimumRequestAmount: number;
};

const SAMPLE_SONG_HISTORY: SongHistory[] = [
  { id: 1, name: "Sweet Child O' Mine", time: "8:15 PM", tips: 15 },
  { id: 2, name: "Hotel California", time: "8:45 PM", tips: 12 },
  { id: 3, name: "Wonderwall", time: "9:10 PM", tips: 8 },
  { id: 4, name: "Bohemian Rhapsody", time: "9:45 PM", tips: 20 },
  { id: 5, name: "Purple Rain", time: "10:15 PM", tips: 10 },
  { id: 6, name: "Stairway to Heaven", time: "10:45 PM", tips: 18 },
];

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const isUpcoming = params.status === 'upcoming';
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [songHistory] = useState<SongHistory[]>(SAMPLE_SONG_HISTORY);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event>({
    id: Number(params.eventId),
    venue: params.venue as string,
    date: params.date as string,
    time: params.time as string,
    location: params.location as string,
    description: params.description as string,
    image: params.image as string,
    minimumRequestAmount: Number(params.minimumRequestAmount) || 5,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    router.push('/(performer)/events');
  };

  const handleSaveEvent = () => {
    if (!editedEvent.venue || !editedEvent.date || !editedEvent.location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    router.replace({
      pathname: '/(performer)/events',
      params: { eventUpdated: 'true' }
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setEditedEvent(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setEditedEvent(prev => ({
        ...prev,
        time: time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }));
    }
  };

  const handleToggleRequests = () => {
    if (!requestsOpen) {
      Alert.alert(
        'Open Song Requests',
        'Are you sure you want to start accepting song requests for this event?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Open Requests',
            onPress: () => setRequestsOpen(true)
          }
        ]
      );
    } else {
      Alert.alert(
        'Close Song Requests',
        'Are you sure you want to stop accepting song requests?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Close Requests',
            style: 'destructive',
            onPress: () => setRequestsOpen(false)
          }
        ]
      );
    }
  };

  const renderEditButton = () => {
    if (!isUpcoming) return null;
    
    return (
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setIsEditModalVisible(true)}
      >
        <Pencil color="#fff" size={24} />
      </TouchableOpacity>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Venue Name</Text>
              <TextInput
                style={styles.input}
                value={editedEvent.venue}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, venue: text }))}
                placeholder="Enter venue name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {editedEvent.date || "Select date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(editedEvent.date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.inputText}>
                  {editedEvent.time || "Select time"}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editedEvent.location}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedEvent.description}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, description: text }))}
                placeholder="Enter event description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Minimum Request Amount</Text>
              <View style={styles.requestAmountContainer}>
                {[5, 10, 15, 20].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.requestAmountOption,
                      editedEvent.minimumRequestAmount === amount && styles.requestAmountOptionSelected
                    ]}
                    onPress={() => setEditedEvent(prev => ({ ...prev, minimumRequestAmount: amount }))}
                  >
                    <Text style={[
                      styles.requestAmountText,
                      editedEvent.minimumRequestAmount === amount && styles.requestAmountTextSelected
                    ]}>
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveEvent}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={{ uri: params.image as string }} 
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', '#1a0b2e']}
          style={styles.headerGradient}
        />
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <ArrowLeft color="#fff" size={24} />
      </TouchableOpacity>

      {renderEditButton()}

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeIn}>
          <Text style={styles.venueName}>{params.venue}</Text>
          {params.description ? (
            <Text style={styles.description}>{params.description}</Text>
          ) : null}

          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#cbd5e1" />
              <Text style={styles.detailText}>{params.date}</Text>
            </View>
            
            {params.time ? (
              <View style={styles.detailItem}>
                <Clock size={16} color="#cbd5e1" />
                <Text style={styles.detailText}>{params.time}</Text>
              </View>
            ) : null}
            
            <View style={styles.detailItem}>
              <MapPin size={16} color="#cbd5e1" />
              <Text style={styles.detailText}>{params.location}</Text>
            </View>
          </View>

          {isUpcoming && (
            <View style={styles.requestsStatus}>
              <View style={[
                styles.statusIndicator,
                requestsOpen ? styles.statusIndicatorActive : styles.statusIndicatorInactive
              ]} />
              <Text style={styles.requestsStatusText}>
                {requestsOpen ? 'Song Requests Open' : 'Song Requests Closed'}
              </Text>
            </View>
          )}

          <View style={styles.statsGrid}>
            {isUpcoming ? (
              <>
                <View style={styles.statCard}>
                  <Users color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>{params.attendees}</Text>
                  <Text style={styles.statLabel}>Attendees</Text>
                </View>

                <View style={styles.statCard}>
                  <Music2 color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>{params.songRequests}</Text>
                  <Text style={styles.statLabel}>Requests</Text>
                </View>

                <View style={styles.statCard}>
                  <Clock color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>3hrs</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statCard}>
                  <Music2 color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>{params.songsPlayed}</Text>
                  <Text style={styles.statLabel}>Songs Played</Text>
                </View>

                <View style={styles.statCard}>
                  <DollarSign color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>${params.totalTips}</Text>
                  <Text style={styles.statLabel}>Total Tips</Text>
                </View>

                <View style={styles.statCard}>
                  <Star color="#4a9eff" size={24} />
                  <Text style={styles.statValue}>{params.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </>
            )}
          </View>

          {isUpcoming ? (
            <>
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  requestsOpen ? styles.stopButton : styles.startButton
                ]}
                onPress={handleToggleRequests}
              >
                {requestsOpen ? (
                  <>
                    <Pause color="#fff" size={24} />
                    <Text style={styles.actionButtonText}>Stop Song Requests</Text>
                  </>
                ) : (
                  <>
                    <Play color="#fff" size={24} />
                    <Text style={styles.actionButtonText}>Allow Song Requests</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.queueButton]}
                onPress={() => router.push(`/(performer)/queue?eventId=${params.eventId}&requestsOpen=${requestsOpen}`)}
              >
                <Music2 color="#fff" size={24} />
                <Text style={styles.actionButtonText}>View Song Queue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.songHistory}>
              <Text style={styles.sectionTitle}>Song History</Text>
              {songHistory.map((song) => (
                <View key={song.id} style={styles.songItem}>
                  <View style={styles.songInfo}>
                    <Text style={styles.songName}>{song.name}</Text>
                    <Text style={styles.songTime}>{song.time}</Text>
                  </View>
                  <Text style={styles.songTips}>${song.tips}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  headerContainer: {
    height: 300,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 250,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  venueName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4a9eff',
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 24,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
  },
  requestsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
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
  requestsStatusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  queueButton: {
    backgroundColor: '#6366f1',
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  songHistory: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  songTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
  },
  songTips: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#10b981',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1a0b2e',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' ? '90%' : '100%',
    maxWidth: 500,
    maxHeight: Platform.OS === 'web' ? '90%' : '100%',
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
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    maxHeight: 400,
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
  inputText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 16,
  },
  requestAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  requestAmountOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  requestAmountOptionSelected: {
    backgroundColor: '#6366f1',
  },
  requestAmountText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  requestAmountTextSelected: {
    color: '#fff',
  },
});