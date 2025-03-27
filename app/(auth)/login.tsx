import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Music2, Lock, User } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPerformer, setIsPerformer] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = () => {
    if (isPerformer) {
      router.replace('/(performer)/');
    } else {
      router.replace('/(tabs)/');
    }
  };

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
      
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.header}>
          <Music2 color="#fff" size={48} />
          <Text style={styles.title}>Boostify</Text>
          <Text style={styles.subtitle}>Music Request Platform</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !isPerformer && styles.toggleButtonActive]}
              onPress={() => setIsPerformer(false)}
            >
              <User color={!isPerformer ? "#fff" : "#666"} size={20} />
              <Text style={[styles.toggleText, !isPerformer && styles.toggleTextActive]}>User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isPerformer && styles.toggleButtonActive]}
              onPress={() => setIsPerformer(true)}
            >
              <Music2 color={isPerformer ? "#fff" : "#666"} size={20} />
              <Text style={[styles.toggleText, isPerformer && styles.toggleTextActive]}>Performer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Lock color="#fff" size={20} />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Link href={{ 
            pathname: "/(auth)/register",
            params: { type: isPerformer ? 'performer' : undefined }
          }} asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>
                {isPerformer ? "New performer? Create an account" : "New user? Create an account"}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#fff',
    marginTop: 20,
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#4a9eff',
    marginTop: 10,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#6366f1',
  },
  toggleText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});