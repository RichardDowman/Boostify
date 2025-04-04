// app/success.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { auth, firestore } from '../../config/firebaseConfig'; // ✅ fixed path
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function SuccessScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const updateWallet = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const walletRef = doc(firestore, 'wallets', user.uid);
        // For demo purposes, simulate +100 tokens. Replace this with actual amount logic if needed.
        await updateDoc(walletRef, { balance: increment(100) });

        Alert.alert('Payment Success', 'Your wallet has been updated.');
        router.replace('/(tabs)/wallet');
      } catch (error) {
        Alert.alert('Error', 'Could not update wallet balance.');
        router.replace('/(tabs)/wallet');
      }
    };

    updateWallet();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#1a0b2e', '#2c1642']} style={styles.container}>
      <Text style={styles.text}>Processing your payment...</Text>
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
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

