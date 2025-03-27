import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Music, Star } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function NearbyScreen() {
  const [venues] = useState([
    {
      id: 1,
      name: "The Blue Note",
      performer: "DJ Mike",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop",
      distance: "0.3",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Jazz Corner",
      performer: "Sarah's Quartet",
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop",
      distance: "0.7",
      rating: 4.6,
    },
    {
      id: 3,
      name: "The Basement",
      performer: "Rock Revolution",
      image: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800&auto=format&fit=crop",
      distance: "1.2",
      rating: 4.5,
    },
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleJoinQueue = (venueId: number) => {
    router.push({
      pathname: "/(tabs)/queue",
      params: { 
        venueId,
        source: 'nearby'
      }
    });
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
      <Text style={styles.title}>Nearby Venues</Text>

      <ScrollView style={styles.venueList}>
        {venues.map((venue, index) => (
          <Animated.View
            key={venue.id}
            entering={FadeInRight.delay(index * 100)}
            style={styles.venueCard}>
            <Image
              source={{ uri: venue.image }}
              style={styles.venueImage}
            />
            <View style={styles.venueInfo}>
              <View style={styles.venueHeader}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star color="#fbbf24" size={16} />
                  <Text style={styles.rating}>{venue.rating}</Text>
                </View>
              </View>
              
              <View style={styles.performerContainer}>
                <Music color="#cbd5e1" size={16} />
                <Text style={styles.performer}>{venue.performer}</Text>
              </View>
              
              <View style={styles.distanceContainer}>
                <MapPin color="#cbd5e1" size={16} />
                <Text style={styles.distance}>{venue.distance} miles away</Text>
              </View>

              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => handleJoinQueue(venue.id)}
              >
                <Text style={styles.joinButtonText}>Join Queue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
    marginTop: 60,
    marginHorizontal: 20,
  },
  venueList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  venueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 200,
  },
  venueInfo: {
    padding: 15,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  venueName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginLeft: 5,
  },
  performerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performer: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cbd5e1',
    marginLeft: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  distance: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
});