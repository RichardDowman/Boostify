// app/cancel.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

export default function CancelScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    Alert.alert('Payment Cancelled', 'No changes were made.');
    router.replace('/(tabs)/wallet');
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#1a0b2e', '#2c1642']} style={styles.container}>
      <Text style={styles.text}>Redirecting...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
  },
});
