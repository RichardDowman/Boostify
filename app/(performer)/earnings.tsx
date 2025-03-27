import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TrendingUp, Music2, Heart } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function EarningsScreen() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  const [earnings] = useState({
    currentEvent: {
      venue: 'The Blue Note',
      songTips: 35,
      directTips: 15,
      totalTips: 50,
      boostifyFee: 10,
      netEarnings: 40
    },
    history: [
      {
        id: 1,
        date: 'Yesterday',
        venue: 'The Blue Note',
        songTips: 145,
        directTips: 55,
        totalTips: 200,
        netEarnings: 160
      },
      {
        id: 2,
        date: 'Last Week',
        venue: 'Jazz Corner',
        songTips: 120,
        directTips: 40,
        totalTips: 160,
        netEarnings: 128
      }
    ]
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1634128222187-18eababc763d?w=800&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(26, 11, 46, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView}>
        <Animated.View entering={FadeIn} style={styles.content}>
          <Text style={styles.title}>Earnings</Text>

          <View style={styles.currentEventCard}>
            <View style={styles.venueHeader}>
              <Text style={styles.venueName}>{earnings.currentEvent.venue}</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.liveIndicatorText}>Live Now</Text>
              </View>
            </View>
            
            <View style={styles.tipsBreakdown}>
              <View style={styles.tipsRow}>
                <Text style={styles.tipsLabel}>Song Request Tips:</Text>
                <Text style={styles.tipsValue}>${earnings.currentEvent.songTips}</Text>
              </View>
              <View style={styles.tipsRow}>
                <Text style={styles.tipsLabel}>Direct Tips:</Text>
                <Text style={styles.tipsValue}>${earnings.currentEvent.directTips}</Text>
              </View>
              <View style={styles.tipsRow}>
                <Text style={styles.tipsLabel}>Total Tips:</Text>
                <Text style={styles.tipsValue}>${earnings.currentEvent.totalTips}</Text>
              </View>
              <View style={styles.tipsRow}>
                <Text style={styles.tipsLabel}>Boostify Fee (20%):</Text>
                <Text style={styles.tipsFee}>-${earnings.currentEvent.boostifyFee}</Text>
              </View>
              <View style={[styles.tipsRow, styles.netTipsRow]}>
                <Text style={styles.netTipsLabel}>Your Earnings:</Text>
                <Text style={styles.netTipsValue}>${earnings.currentEvent.netEarnings}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Music2 color="#4a9eff" size={24} />
                <Text style={styles.statValue}>${earnings.currentEvent.songTips}</Text>
                <Text style={styles.statLabel}>Song Tips</Text>
              </View>
              <View style={styles.statCard}>
                <Heart color="#4a9eff" size={24} />
                <Text style={styles.statValue}>${earnings.currentEvent.directTips}</Text>
                <Text style={styles.statLabel}>Direct Tips</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp color="#4a9eff" size={24} />
                <Text style={styles.statValue}>${earnings.currentEvent.netEarnings}</Text>
                <Text style={styles.statLabel}>Net Earnings</Text>
              </View>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Earnings History</Text>
            {earnings.history.map((event, index) => (
              <Animated.View
                key={event.id}
                entering={FadeInUp.delay(index * 100)}
                style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.venueInfo}>
                    <Text style={styles.venueName}>{event.venue}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                  <Text style={styles.historyEarnings}>${event.netEarnings}</Text>
                </View>
                
                <View style={styles.historyDetails}>
                  <View style={styles.detailItem}>
                    <Music2 size={16} color="#4a9eff" />
                    <Text style={styles.detailText}>${event.songTips} in song tips</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Heart size={16} color="#4a9eff" />
                    <Text style={styles.detailText}>${event.directTips} in direct tips</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  currentEventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  venueName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveIndicatorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#10b981',
  },
  tipsBreakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  tipsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#10b981',
  },
  tipsFee: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ef4444',
  },
  netTipsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  netTipsLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  netTipsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#10b981',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4a9eff',
  },
  historySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  venueInfo: {
    flex: 1,
  },
  eventDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4a9eff',
  },
  historyEarnings: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#10b981',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
});