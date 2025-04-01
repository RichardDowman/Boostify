import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Music2, User, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore, functions } from '../../config/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import * as WebBrowser from 'expo-web-browser';

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const [isPerformer, setIsPerformer] = useState(params.type === 'performer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (params.type === 'performer') setIsPerformer(true);
  }, [params.type]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });
  if (!fontsLoaded) return null;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Name, email and password are required');
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email: user.email,
        role: isPerformer ? 'performer' : 'guest',
        bio: bio || (isPerformer ? 'Musician' : 'Music Enthusiast'),
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(firestore, 'wallets', user.uid), {
        userId: user.uid,
        balance: 0,
        createdAt: serverTimestamp(),
      });

      if (isPerformer) {
        const createStripeAccountLink = httpsCallable(functions, 'createStripeAccountLink');
        const result = await createStripeAccountLink({ uid: user.uid });

        if (result.data && result.data.link && result.data.accountId) {
          await updateDoc(doc(firestore, 'users', user.uid), {
            stripeAccountId: result.data.accountId,
          });
          await WebBrowser.openBrowserAsync(result.data.link);
        }
      }

      router.replace(isPerformer ? '/(performer)/profile' : '/(tabs)/profile');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
        }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(26,11,46,0.8)', 'rgba(26,11,46,0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View entering={FadeIn} style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.header}>
          <Music2 color="#fff" size={48} />
          <Text style={styles.title}>Create Account</Text>
        </View>
        <View style={styles.form}>
          {!params.type && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isPerformer && styles.toggleButtonActive]}
                onPress={() => setIsPerformer(false)}>
                <User color={!isPerformer ? '#fff' : '#666'} size={20} />
                <Text style={[styles.toggleText, !isPerformer && styles.toggleTextActive]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isPerformer && styles.toggleButtonActive]}
                onPress={() => setIsPerformer(true)}>
                <Music2 color={isPerformer ? '#fff' : '#666'} size={20} />
                <Text style={[styles.toggleText, isPerformer && styles.toggleTextActive]}>Performer</Text>
              </TouchableOpacity>
            </View>
          )}
          {params.type === 'performer' && (
            <View style={styles.accountTypeIndicator}>
              <Music2 color="#fff" size={20} />
              <Text style={styles.accountTypeText}>Performer Account</Text>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {(isPerformer || params.type === 'performer') && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bio"
                placeholderTextColor="#666"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.registerButton,
              (!name || !email || !password) && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0b2e' },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.5 },
  content: { padding: 20, paddingTop: 60, minHeight: '100%' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginTop: 20,
    textShadowColor: 'rgba(74,158,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  toggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8, borderRadius: 8 },
  toggleButtonActive: { backgroundColor: '#6366f1' },
  toggleText: { fontFamily: 'Inter-Bold', fontSize: 14, color: '#666' },
  toggleTextActive: { color: '#fff' },
  accountTypeIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366f1', borderRadius: 12, padding: 12, marginBottom: 20, gap: 8 },
  accountTypeText: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 16, fontFamily: 'Inter-Regular' },
  textArea: { height: 100, textAlignVertical: 'top' },
  registerButton: { backgroundColor: '#6366f1', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10 },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-Bold' },
});
