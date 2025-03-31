// app/(tabs)/wallet.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { auth, firestore } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const user = auth.currentUser;
      if (user) {
        const walletRef = doc(firestore, 'wallets', user.uid);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          setBalance(walletSnap.data().balance);
        } else {
          setBalance(0);
        }
      }
      setLoading(false);
    };

    fetchWalletBalance();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a0b2e', '#2c1642']} style={styles.gradient}>
        <Animated.View entering={FadeIn} style={styles.content}>
          <Text style={styles.header}>Your Wallet</Text>
          <View style={styles.balanceContainer}>
            <CreditCard color="#fff" size={32} />
            <Text style={styles.balanceLabel}>Current Balance</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.balance}>{balance} Tokens</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={() => router.push('/(tabs)/add-funds')}
          >
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
  },
  header: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
  balance: {
    fontSize: 36,
    color: '#4a9eff',
    fontFamily: 'Inter-Bold',
    marginTop: 10,
  },
  addFundsButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 20,
  },
  addFundsText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
