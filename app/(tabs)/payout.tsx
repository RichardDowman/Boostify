// app/(tabs)/payout.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "../../config/firebaseConfig";

export default function PayoutScreen() {
  const [loading, setLoading] = useState(false);

  const handleSendPayout = async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const sendPayout = httpsCallable(functions, "sendPayout");
      // Replace these test values with real data as needed.
      const testData = {
        eventId: "testEvent123",
        performerAccountId: "acct_test123", // Use a valid connected Stripe account ID in production.
        performerId: auth.currentUser ? auth.currentUser.uid : "testPerformer",
      };
      const result = await sendPayout(testData);
      Alert.alert("Payout Successful", `Transfer ID: ${result.data.transferId}`);
    } catch (error: any) {
      Alert.alert("Payout Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a0b2e", "#2c1642"]} style={styles.gradient}>
        <Animated.View entering={FadeIn} style={styles.content}>
          <Text style={styles.header}>Test Payout</Text>
          <TouchableOpacity style={styles.button} onPress={handleSendPayout} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Payout</Text>
            )}
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 30,
  },
  header: {
    fontSize: 32,
    color: "#fff",
    fontFamily: "Inter-Bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
});
