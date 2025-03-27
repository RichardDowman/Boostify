import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, CreditCard, History } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function WalletScreen() {
  const [balance, setBalance] = useState(50);
  const [transactions] = useState([
    { id: 1, type: 'Boost', amount: -2, song: 'Sweet Child O\' Mine' },
    { id: 2, type: 'Request', amount: -5, song: 'Hotel California' },
    { id: 3, type: 'Load', amount: 20, song: null },
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAddFunds = () => {
    Alert.alert(
      'Add Funds',
      'How much would you like to add to your wallet?',
      [
        {
          text: '$10',
          onPress: () => {
            setBalance(prev => prev + 10);
            Alert.alert('Success', 'Added $10 to your wallet!');
          },
        },
        {
          text: '$20',
          onPress: () => {
            setBalance(prev => prev + 20);
            Alert.alert('Success', 'Added $20 to your wallet!');
          },
        },
        {
          text: '$50',
          onPress: () => {
            setBalance(prev => prev + 50);
            Alert.alert('Success', 'Added $50 to your wallet!');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1634128222187-18eababc763d?w=800&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.8)', 'rgba(45, 27, 78, 0.85)']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.balanceCard}>
          <Wallet color="#fff" size={32} />
          <Text style={styles.balanceTitle}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addFundsButton} onPress={handleAddFunds}>
            <CreditCard color="#fff" size={24} />
            <Text style={styles.buttonText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <History color="#fff" size={24} />
            <Text style={styles.transactionsTitle}>Recent Activity</Text>
          </View>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                {transaction.song && (
                  <Text style={styles.songName}>{transaction.song}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? '#10b981' : '#ef4444' },
                ]}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  balanceAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#fff',
    marginVertical: 10,
  },
  addFundsButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 10,
  },
  transactionsContainer: {
    marginTop: 30,
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginLeft: 10,
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionType: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  songName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 4,
  },
  transactionAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});