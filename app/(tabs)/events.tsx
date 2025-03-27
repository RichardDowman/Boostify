import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Platform, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Music2, Users, Search, Clock, Filter, X } from 'lucide-react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

type Event = {
  id: number;
  title: string;
  performer: string;
  venue: string;
  date: string;
  time: string;
  location: string;
  image: string;
  genre: string;
  attendees: number;
};

// Comprehensive list of music genres
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);

  const [events] = useState<Event[]>([
    {
      id: 1,
      title: "Jazz Night Extravaganza",
      performer: "Sarah's Quartet",
      venue: "Blue Note Jazz Club",
      date: "2025-02-15",
      time: "8:00 PM",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop",
      genre: "Jazz",
      attendees: 120
    },
    {
      id: 2,
      title: "Rock Revolution Live",
      performer: "Thunder Strike",
      venue: "The Basement",
      date: "2025-02-20",
      time: "9:00 PM",
      location: "Los Angeles, CA",
      image: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800&auto=format&fit=crop",
      genre: "Rock",
      attendees: 200
    },
    {
      id: 3,
      title: "Electronic Dreams Festival",
      performer: "DJ Pulse",
      venue: "Neon Gardens",
      date: "2025-03-01",
      time: "10:00 PM",
      location: "Miami, FL",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop",
      genre: "Electronic",
      attendees: 500
    },
    {
      id: 4,
      title: "Acoustic Evening",
      performer: "Luna & The Strings",
      venue: "Harmony Hall",
      date: "2025-03-05",
      time: "7:30 PM",
      location: "Nashville, TN",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
      genre: "Folk",
      attendees: 150
    }
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.performer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !selectedDate || event.date === selectedDate.toISOString().split('T')[0];
    const matchesGenre = !selectedGenre || event.genre === selectedGenre;

    return matchesSearch && matchesDate && matchesGenre;
  });

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedGenre(null);
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(45, 27, 78, 0.85)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Events</Text>
        
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, locations, performers..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter color="#fff" size={20} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          {(selectedDate || selectedGenre) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <View style={styles.filtersPanel}>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                style={webDatePickerStyle}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  } else {
                    setSelectedDate(null);
                  }
                }}
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                min={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar color="#4a9eff" size={20} />
                <Text style={styles.datePickerButtonText}>
                  {selectedDate ? formatDate(selectedDate.toISOString()) : 'Select Date'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.genrePickerButton}
              onPress={() => setShowGenreModal(true)}
            >
              <Music2 color="#4a9eff" size={20} />
              <Text style={styles.genrePickerButtonText}>
                {selectedGenre || 'Select Genre'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {Platform.OS !== 'web' && showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <ScrollView style={styles.eventsList}>
        {filteredEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => router.push({
              pathname: "/(tabs)/queue",
              params: { eventId: event.id }
            })}
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

              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.genreTag}>
                    <Text style={styles.genreTagText}>{event.genre}</Text>
                  </View>
                </View>

                <View style={styles.performerInfo}>
                  <Music2 color="#4a9eff" size={16} />
                  <Text style={styles.performerName}>{event.performer}</Text>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.time}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.venue} • {event.location}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Users size={16} color="#cbd5e1" />
                    <Text style={styles.detailText}>{event.attendees} attending</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showGenreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Genre</Text>
              <TouchableOpacity
                onPress={() => setShowGenreModal(false)}
                style={styles.modalCloseButton}
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
                    selectedGenre === genre && styles.genreOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedGenre(genre === selectedGenre ? null : genre);
                    setShowGenreModal(false);
                  }}
                >
                  <Text style={[
                    styles.genreOptionText,
                    selectedGenre === genre && styles.genreOptionTextSelected
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const webDatePickerStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  borderRadius: 8,
  padding: 12,
  color: '#fff',
  fontFamily: 'Inter-Regular',
  fontSize: 14,
  cursor: 'pointer',
  width: '100%',
};

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
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 45,
    paddingRight: 15,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    gap: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  clearButtonText: {
    color: '#4a9eff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  filtersPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    gap: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  datePickerButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  genrePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  genrePickerButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    width: '100%',
    maxWidth: 400,
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
  modalCloseButton: {
    padding: 8,
  },
  genreList: {
    maxHeight: 400,
  },
  genreOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginRight: 10,
  },
  genreTag: {
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  genreTagText: {
    color: '#4a9eff',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  performerName: {
    color: '#4a9eff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#cbd5e1',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  }
});