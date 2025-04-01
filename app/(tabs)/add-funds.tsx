// app/(tabs)/add-funds.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { functions } from '../../config/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { StripeProvider } from '@stripe/stripe-react-native';

const presetAmounts = [5, 10, 20, 50, 100];

export default function AddFundsScreen() {
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });
  if (!fontsLoaded) return null;

  const handleAddFunds = async (amount: number) => {
    setLoading(true);
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({ amount });

      if (result?.data?.sessionId) {
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${result.data.sessionId}`;
        Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'No session ID returned');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StripeProvider publishableKey="pk_test_51R2PGSE0e3X64HIoLyA9vGCLzHjCQlg6KY0SaJ8YZBGuf0M8OslETcTXjGy06c6FxylNk9L7V5KaRfG9L31rz2IX00eU3lftld">
      <View style={styles.container}>
        <LinearGradient colors={['#1a0b2e', '#2c1642']} style={styles.gradient}>
          <Animated.View entering={FadeIn} style={styles.content}>
            <Text style={styles.header}>Add Funds</Text>
            <Text style={styles.subHeader}>Select an amount to top up your wallet:</Text>
            <View style={styles.amountsContainer}>
              {presetAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.amountButton}
                  onPress={() => handleAddFunds(amount)}
                  disabled={loading}
                >
                  <CreditCard color="#fff" size={24} />
                  <Text style={styles.amountText}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {loading && <ActivityIndicator size="large" color="#fff" />}
          </Animated.View>
        </LinearGradient>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
  },
  header: { fontSize: 32, color: '#fff', fontFamily: 'Inter-Bold', marginBottom: 10 },
  subHeader: { fontSize: 18, color: '#fff', fontFamily: 'Inter-Regular', marginBottom: 20 },
  amountsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  amountButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountText: { color: '#fff', fontSize: 18, fontFamily: 'Inter-Bold' },
});


