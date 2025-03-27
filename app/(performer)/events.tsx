import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Platform, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Music2, Users, Plus, X, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

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

const MUSIC_GENRES = [
  "Rock", "Jazz", "Blues", "Classical", "Electronic",
  "Pop", "Hip Hop", "R&B", "Country", "Folk",
  "Metal", "Punk", "Reggae", "Soul", "Funk",
  "Latin", "World", "Alternative", "Indie", "Gospel",
  "EDM", "Techno", "House", "Ambient", "Acoustic"
];

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    venue: '',
    date: '',
    time: '',
    location: '',
    genre: '',
    minimumRequestAmount: 5
  });

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    {
      id: 1,
      venue: "The Blue Note",
      date: "Today",
      time: "Live Now",
      location: "456 Music Avenue",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
      attendees: 45,
      songRequests: 12,
      status: 'active',
      description: "Live Jazz Night",
      requestsOpen: true,
      minimumRequestAmount: 5
    },
    {
      id: 2,
      venue: "Rhythm House",
      date: "Tomorrow",
      time: "9:00 PM",
      location: "456 Music Avenue",
      image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&auto=format&fit=crop",
      attendees: 30,
      songRequests: 8,
      status: 'upcoming',
      description: "Acoustic Evening",
      requestsOpen: false,
      minimumRequestAmount: 10
    }
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setNewEvent(prev => ({ ...prev, date: formatDate(date) }));
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      setNewEvent(prev => ({ ...prev, time: formatTime(date) }));
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.venue || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.genre) {
      Alert.alert('Missing Information', 'Please fill in all fields including genre.');
      return;
    }

    const newEventObj: Event = {
      id: Math.max(...upcomingEvents.map(e => e.id)) + 1,
      venue: newEvent.venue,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
      attendees: 0,
      songRequests: 0,
      status: 'upcoming',
      description: 'New Event',
      requestsOpen: false,
      minimumRequestAmount: newEvent.minimumRequestAmount
    };

    setUpcomingEvents(prevEvents => [...prevEvents, newEventObj]);
    setNewEvent({ venue: '', date: '', time: '', location: '', genre: '', minimumRequestAmount: 5 });
    setIsModalVisible(false);
  };

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/(performer)/event-details",
      params: {
        eventId: event.id,
        venue: event.venue,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image,
        description: event.description,
        status: event.status,
        minimumRequestAmount: event.minimumRequestAmount
      }
    });
  };

  const renderDateInput = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '15px',
            color: '#fff',
            fontFamily: 'Inter-Regular',
            fontSize: '16px',
            width: '100%',
            cursor: 'pointer',
            outline: 'none'
          }}
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => {
            if (e.target.value) {
              const date = new Date(e.target.value);
              setSelectedDate(date);
              setNewEvent(prev => ({ ...prev, date: formatDate(date) }));
            }
          }}
          min={new Date().toISOString().split('T')[0]}
        />
      );
    }

    return (
      <View style={styles.dateTimeInputContainer}>
        <TouchableOpacity
          style={[styles.input, styles.dateTimeInput]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar color="#666" size={20} />
          <Text style={styles.inputText}>
            {newEvent.date || "Select date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  const renderTimeInput = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="time"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '15px',
            color: '#fff',
            fontFamily: 'Inter-Regular',
            fontSize: '16px',
            width: '100%',
            cursor: 'pointer',
            outline: 'none'
          }}
          value={selectedTime.toTimeString().slice(0, 5)}
          onChange={(e) => {
            if (e.target.value) {
              const [hours, minutes] = e.target.value.split(':');
              const time = new Date();
              time.setHours(parseInt(hours), parseInt(minutes));
              setSelectedTime(time);
              setNewEvent(prev => ({ ...prev, time: formatTime(time) }));
            }
          }}
        />
      );
    }

    return (
      <View style={styles.dateTimeInputContainer}>
        <TouchableOpacity
          style={[styles.input, styles.dateTimeInput]}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock color="#666" size={20} />
          <Text style={styles.inputText}>
            {newEvent.time || "Select time"}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showTimePicker}
            onRequestClose={() => setShowTimePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            >
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  const renderGenrePicker = () => (
    <Modal
      visible={showGenrePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowGenrePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Genre</Text>
            <TouchableOpacity
              onPress={() => setShowGenrePicker(false)}
              style={styles.closeButton}
            >
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.genreList}>
            {MUSIC_GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreOption,
                  newEvent.genre === genre && styles.genreOptionSelected
                ]}
                onPress={() => {
                  setNewEvent(prev => ({ ...prev, genre }));
                  setShowGenrePicker(false);
                }}
              >
                <View style={styles.genreOptionContent}>
                  <Music2 
                    color={newEvent.genre === genre ? "#fff" : "#4a9eff"} 
                    size={20} 
                  />
                  <Text style={[
                    styles.genreOptionText,
                    newEvent.genre === genre && styles.genreOptionTextSelected
                  ]}>
                    {genre}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
        <Text style={styles.title}>My Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsList}>
        {upcomingEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => handleEventPress(event)}
          >
            <Animated.View
              entering={FadeInRight.delay(index * 100)}
              style={styles.eventCard}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.eventImageOverlay}
              />

              {event.status === 'active' && (
                <View style={styles.activeEventBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeEventText}>Live Now</Text>
                </View>
              )}

              <View style={styles.eventInfo}>
                <Text style={styles.venueName}>{event.venue}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
                
                <View style={styles.eventDetails}>
                  <View style={styles.detailItem}>
                    <Calendar size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.date}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.time}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                </View>

                <View style={styles.eventStats}>
                  <View style={styles.statItem}>
                    <Users size={16} color="#4a9eff" />
                    <Text style={styles.statText}>{event.attendees} attendees</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Music2 size={16} color="#4a9eff" />
                    <Text style={styles.statText}>{event.songRequests} requests</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Venue Name</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.venue}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, venue: text }))}
                  placeholder="Enter venue name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                {renderDateInput()}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                {renderTimeInput()}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
                  placeholder="Enter location"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Genre</Text>
                <TouchableOpacity
                  style={[styles.input, styles.genreInput]}
                  onPress={() => setShowGenrePicker(true)}
                >
                  <View style={styles.genreInputContent}>
                    <Music2 color={newEvent.genre ? "#4a9eff" : "#666"} size={20} />
                    <Text style={[
                      styles.inputText,
                      newEvent.genre && styles.selectedInputText
                    ]}>
                      {newEvent.genre || "Select genre"}
                    </Text>
                  </View>
                  <ChevronDown color="#666" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Minimum Request Amount</Text>
                <View style={styles.requestAmountContainer}>
                  {[5, 10, 15, 20].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.requestAmountOption,
                        newEvent.minimumRequestAmount === amount && styles.requestAmountOptionSelected
                      ]}
                      onPress={() => setNewEvent(prev => ({ ...prev, minimumRequestAmount: amount }))}
                    >
                      <Text style={[
                        styles.requestAmountText,
                        newEvent.minimumRequestAmount === amount && styles.requestAmountTextSelected
                      ]}>
                        ${amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.addEventButton,
                (!newEvent.venue || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.genre) && 
                styles.addEventButtonDisabled
              ]}
              onPress={handleAddEvent}
            >
              <Text style={styles.addEventButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderGenrePicker()}
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
    opacity: 0.5,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  activeEventBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  activeEventText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  eventInfo: {
    padding: 16,
  },
  venueName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  eventDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
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
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a0b2e',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 20,
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
    maxHeight: 500,
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
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  genreInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genreInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedInputText: {
    color: '#4a9eff',
    fontFamily: 'Inter-Bold',
  },
  genreList: {
    maxHeight: '100%',
  },
  genreOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  genreOptionSelected: {
    backgroundColor: '#4a9eff',
  },
  genreOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  genreOptionTextSelected: {
    fontFamily: 'Inter-Bold',
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
    backgroundColor: '#4a9eff',
  },
  requestAmountText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  requestAmountTextSelected: {
    color: '#fff',
  },
  addEventButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addEventButtonDisabled: {
    opacity: 0.5,
  },
  addEventButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 16,
  },
  pickerOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: 4,
    padding: 8,
    zIndex: 1000,
  },
  dateTimeInputContainer: {
    position: 'relative',
    width: '100%',
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
});