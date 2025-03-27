import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { StyleSheet } from 'react-native';

// Create a style tag for custom scrollbar styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      background-color: transparent;
    }

    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: rgba(74, 158, 255, 0.3);
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: rgba(74, 158, 255, 0.5);
    }

    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(74, 158, 255, 0.3) rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(performer)" />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}