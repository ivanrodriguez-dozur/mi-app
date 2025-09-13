import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen 
            name="tournaments" 
            options={{ 
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom'
            }} 
          />
          <Stack.Screen 
            name="battle" 
            options={{ 
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_right'
            }} 
          />
          <Stack.Screen 
            name="tournament-cards-demo" 
            options={{ 
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom'
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
