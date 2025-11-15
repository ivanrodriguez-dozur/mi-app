import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { BottomNavProvider } from '@/contexts/BottomNavContext';
import { BottomNavBar } from '@/components/profile/BottomNavBar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ShopProvider } from '@/contexts/ShopContext';
import { BlockchainProvider } from '@/contexts/BlockchainContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load Ionicons font
  const [fontsLoaded, fontError] = useFonts({
    'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded or an error occurred
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BlockchainProvider>
          <ShopProvider>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <BottomNavProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen
                  name="tournaments"
                  options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="battle"
                  options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="tournament-cards-demo"
                  options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="product/[productId]"
                  options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="new-followers"
                  options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="activity"
                  options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="system-notifications"
                  options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="message-requests"
                  options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
                />
              </Stack>
              <BottomNavBar />
              <StatusBar style="auto" />
            </BottomNavProvider>
          </NavigationThemeProvider>
        </ShopProvider>
        </BlockchainProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
