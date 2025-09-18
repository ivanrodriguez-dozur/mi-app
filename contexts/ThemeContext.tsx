import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  isAutoTheme: boolean;
  highContrast: boolean;
  reducedAnimations: boolean;
  largeFonts: boolean;
  colors: ColorScheme;
  fontScale: number;
  toggleDarkMode: () => void;
  toggleAutoTheme: () => void;
  setThemeSettings: (settings: Partial<ThemeSettings>) => void;
}

interface ThemeSettings {
  isDarkMode: boolean;
  isAutoTheme: boolean;
  highContrast: boolean;
  reducedAnimations: boolean;
  largeFonts: boolean;
}

interface ColorScheme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

const lightColors: ColorScheme = {
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#CCFF00',
  border: '#e2e8f0',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const darkColors: ColorScheme = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#CCFF00',
  border: '#475569',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const lightHighContrastColors: ColorScheme = {
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#333333',
  accent: '#CCFF00',
  border: '#000000',
  success: '#006600',
  error: '#cc0000',
  warning: '#cc6600',
};

const darkHighContrastColors: ColorScheme = {
  background: '#000000',
  surface: '#111111',
  card: '#222222',
  text: '#ffffff',
  textSecondary: '#cccccc',
  accent: '#CCFF00',
  border: '#ffffff',
  success: '#00ff00',
  error: '#ff0000',
  warning: '#ffaa00',
};

/**
 * Contexto global para el manejo de temas
 * Para usar: const { isDarkMode, colors, toggleDarkMode } = useTheme();
 * Para personalizar: Modifica los objetos lightColors y darkColors
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSettings, setThemeSettingsState] = useState<ThemeSettings>({
    isDarkMode: false,
    isAutoTheme: false,
    highContrast: false,
    reducedAnimations: false,
    largeFonts: false,
  });

  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Cargar configuración guardada al iniciar la app
  useEffect(() => {
    loadThemeSettings();
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    saveThemeSettings(themeSettings);
  }, [themeSettings]);

  const loadThemeSettings = async () => {
    try {
      // const savedSettings = await AsyncStorage.getItem('themeSettings');
      // if (savedSettings) {
      //   setThemeSettingsState(JSON.parse(savedSettings));
      // }
      console.log('Theme settings loaded from memory');
    } catch (error) {
      console.log('Error loading theme settings:', error);
    }
  };

  const saveThemeSettings = async (settings: ThemeSettings) => {
    try {
      // await AsyncStorage.setItem('themeSettings', JSON.stringify(settings));
      console.log('Theme settings saved to memory:', settings);
    } catch (error) {
      console.log('Error saving theme settings:', error);
    }
  };

  // Determinar si usar modo oscuro
  const shouldUseDarkMode = themeSettings.isAutoTheme 
    ? systemColorScheme === 'dark'
    : themeSettings.isDarkMode;

  // Seleccionar colores según el tema actual y alto contraste
  const getColors = (): ColorScheme => {
    if (themeSettings.highContrast) {
      return shouldUseDarkMode ? darkHighContrastColors : lightHighContrastColors;
    }
    return shouldUseDarkMode ? darkColors : lightColors;
  };

  const colors = getColors();

  // Escala de fuente basada en configuración
  const fontScale = themeSettings.largeFonts ? 1.2 : 1.0;

  const toggleDarkMode = () => {
    setThemeSettingsState(prev => ({
      ...prev,
      isDarkMode: !prev.isDarkMode,
      isAutoTheme: false, // Desactivar auto cuando se cambie manualmente
    }));
  };

  const toggleAutoTheme = () => {
    setThemeSettingsState(prev => ({
      ...prev,
      isAutoTheme: !prev.isAutoTheme,
    }));
  };

  const setThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettingsState(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const value: ThemeContextType = {
    isDarkMode: shouldUseDarkMode,
    isAutoTheme: themeSettings.isAutoTheme,
    highContrast: themeSettings.highContrast,
    reducedAnimations: themeSettings.reducedAnimations,
    largeFonts: themeSettings.largeFonts,
    colors,
    fontScale,
    toggleDarkMode,
    toggleAutoTheme,
    setThemeSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { darkColors, lightColors };
export type { ColorScheme, ThemeSettings };
