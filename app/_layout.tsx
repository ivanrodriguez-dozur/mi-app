import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { BottomNavProvider } from '@/contexts/BottomNavContext';
import { BottomNavBar } from '@/components/profile/BottomNavBar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ShopProvider } from '@/contexts/ShopContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}
